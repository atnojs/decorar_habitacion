<?php
declare(strict_types=1); // <--- IMPORTANTE: primera línea

// ===============================
// DECORAR HABITACION - PROXY
// ===============================

// ---------- CORS ----------
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// ---------- CSP (🔥 CLAVE PARA FIREBASE 🔥) ----------
header(
  "Content-Security-Policy: " .
  "default-src 'self'; " .
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' " .
    "https://www.gstatic.com " .
    "https://www.googleapis.com " .
    "https://unpkg.com " .
    "https://cdn.jsdelivr.net " .
    "https://cdn.tailwindcss.com; " .
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
  "font-src 'self' https://fonts.gstatic.com; " .
  "img-src 'self' data: blob: https://*.googleusercontent.com; " .
  "connect-src 'self' " .
    "https://firestore.googleapis.com " .
    "https://identitytoolkit.googleapis.com " .
    "https://securetoken.googleapis.com " .
    "https://www.googleapis.com;"
);

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------- ERRORES ----------
ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

// ---------- API KEY ----------
$API_KEY = getenv('B');

// Si quieres hardcodearla temporalmente:
// if (!$API_KEY) {
//     $API_KEY = "TU_API_KEY_AQUI";
// }

if (!$API_KEY) {
    http_response_code(500);
    echo json_encode(['error' => 'Falta la API key en el servidor.']);
    exit;
}

// ---------- MÉTODO ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Usa POST.']);
    exit;
}

// ---------- INPUT ----------
$raw = file_get_contents('php://input');
if (!$raw) {
    http_response_code(400);
    echo json_encode(['error' => 'Body vacío.']);
    exit;
}

$req = json_decode($raw, true);
if (!is_array($req)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido.']);
    exit;
}

// ---------- MODELO ----------
$model  = $req['model']  ?? 'gemini-3-pro-image-preview';
$action = $req['action'] ?? 'generate';

$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$API_KEY}";

// ---------- PAYLOAD ----------
$payload = [];

if (isset($req['contents'])) {
    $payload['contents'] = $req['contents'];
    if (isset($req['generationConfig'])) {
        $payload['generationConfig'] = $req['generationConfig'];
    }
}

if ($action === 'generate') {
    $payload['generationConfig']['responseModalities'] = ['IMAGE'];
}

// ---------- CURL ----------
$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_TIMEOUT => 90,
]);

$response = curl_exec($ch);

if ($response === false) {
    $err = curl_error($ch);
    curl_close($ch);
    http_response_code(502);
    echo json_encode(['error' => 'Error de comunicación con Google', 'details' => $err]);
    exit;
}

$code = curl_getinfo($ch, CURLINFO_HTTP_CODE) ?: 500;
curl_close($ch);

// ---------- RESPUESTA ----------
http_response_code($code);
echo $response;