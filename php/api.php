<?php
/**
 * RESTful API Controller in PHP
 * Ghazal Language Academy Management System
 */

require_once __DIR__ . '/config.php';

// Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ø§Ø² Ù¾Ø§Ø³Ø® Ù¾ÛŒØ´â€ŒÙØ±Ø¶ OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJson(['status' => 'ok']);
}

$pdo = getDbConnection();

// ØªØ¹ÛŒÛŒÙ† Ø§Ú©Ø´Ù† Ø¨Ø± Ø§Ø³Ø§Ø³ Ú©ÙˆØ¦Ø±ÛŒ Ù¾Ø§Ø±Ø§Ù…ØªØ± action ÛŒØ§ Ù…Ø³ÛŒØ± URL
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Ø¯Ø±ÛŒØ§ÙØª Ù¾Ø§Ø±Ø§Ù…ØªØ± ID Ø¯Ø± ØµÙˆØ±Øª ÙˆØ¬ÙˆØ¯
$id = $_GET['id'] ?? null;

// ØªÙˆØ§Ø¨Ø¹ Ú©Ù…Ú©ÛŒ ØªØ¨Ø¯ÛŒÙ„ ID Ø¨Ø±Ø§ÛŒ Ù‡Ù…Ø§Ù‡Ù†Ú¯ÛŒ ÙØ±Ø§Ù†Øªâ€ŒØ§Ù†Ø¯
function mapId($rows) {
    return array_map(function($row) {
        if (isset($row['id'])) {
            $row['_id'] = (string)$row['id'];
            $row['id'] = (string)$row['id'];
        }
        return $row;
    }, $rows);
}

// -------------------------------------------------------------
// Ø§Ú©Ø´Ù†â€ŒÙ‡Ø§
// -------------------------------------------------------------

switch ($action) {

    // 1. Ø¨Ø±Ø±Ø³ÙŠ Ø³Ù„Ø§Ù…Øª Ø³Ø±ÙˆØ±
    case 'health':
        sendJson(['status' => 'ok', 'database' => 'mysql', 'php_version' => PHP_VERSION]);
        break;

    // 2. Ø§Ø­Ø±Ø§Ø² Ù‡ÙˆÛŒØª Ùˆ Ù„Ø§Ú¯ÛŒÙ†
    case 'login':
        if ($method !== 'POST') sendJson(['error' => 'Method Not Allowed'], 405);
        $input = getJsonInput();
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        $stmt = $pdo->prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $user = $stmt->fetch();

        if ($user) {
            sendJson(['success' => true, 'user' => $user]);
        } else {
            sendJson(['success' => false, 'message' => 'Ù†Ø§Ù… Ú©Ø§Ø±Ø¨Ø±ÛŒ ÛŒØ§ Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø§Ø´ØªØ¨Ø§Ù‡ Ø§Ø³Øª'], 401);
        }
        break;

    // 3. Ù…Ø¯ÛŒØ±ÛŒØª ØªØ±Ù…â€ŒÙ‡Ø§
    case 'terms':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM terms ORDER BY createdAt DESC");
            sendJson(mapId($stmt->fetchAll()));
        } elseif ($method === 'POST') {
            $input = getJsonInput();
            $name = $input['name'] ?? '';
            $status = $input['status'] ?? 'active';
            $createdAt = $input['createdAt'] ?? (int)(microtime(true) * 1000);

            $stmt = $pdo->prepare("INSERT INTO terms (name, status, createdAt) VALUES (?, ?, ?)");
            $stmt->execute([$name, $status, $createdAt]);
            $insertId = (string)$pdo->lastInsertId();

            sendJson(['_id' => $insertId, 'id' => $insertId, 'name' => $name, 'status' => $status, 'createdAt' => $createdAt]);
        } elseif ($method === 'PATCH') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $input = getJsonInput();
            $name = $input['name'] ?? null;
            $status = $input['status'] ?? null;

            $stmt = $pdo->prepare("UPDATE terms SET name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?");
            $stmt->execute([$name, $status, $id]);
            sendJson(['success' => true]);
        } elseif ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'ID required'], 400);

            // Ø¨Ø±Ø±Ø³ÛŒ Ø¬Ø§Ø¨Ø¬Ø§ÛŒÛŒ ÛŒØ§ Ø§Ø³ØªÙØ§Ø¯Ù‡ ØªØ±Ù… Ù‚Ø¨Ù„ Ø­Ø°Ù
            $sCheck = $pdo->prepare("SELECT COUNT(*) as cnt FROM students WHERE termId = ?");
            $sCheck->execute([$id]);
            if ($sCheck->fetch()['cnt'] > 0) {
                sendJson(['error' => 'Ø§Ù…Ú©Ø§Ù† Ø­Ø°Ù ØªØ±Ù… Ø¯Ø§Ø±Ø§ÛŒ Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ² ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯'], 400);
            }

            $salCheck = $pdo->prepare("SELECT COUNT(*) as cnt FROM salaries WHERE termId = ?");
            $salCheck->execute([$id]);
            if ($salCheck->fetch()['cnt'] > 0) {
                sendJson(['error' => 'Ø§Ù…Ú©Ø§Ù† Ø­Ø°Ù ØªØ±Ù… Ø¯Ø§Ø±Ø§ÛŒ Ø³ÙˆØ§Ø¨Ù‚ Ø­Ù‚ÙˆÙ‚ÛŒ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯'], 400);
            }

            $expCheck = $pdo->prepare("SELECT COUNT(*) as cnt FROM expenses WHERE termId = ?");
            $expCheck->execute([$id]);
            if ($expCheck->fetch()['cnt'] > 0) {
                sendJson(['error' => 'Ø§Ù…Ú©Ø§Ù† Ø­Ø°Ù ØªØ±Ù… Ø¯Ø§Ø±Ø§ÛŒ Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯'], 400);
            }

            $stmt = $pdo->prepare("DELETE FROM terms WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }
        break;

    // 4. Ù…Ø¯ÛŒØ±ÛŒØª Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ²Ø§Ù†
    case 'students':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM students ORDER BY createdAt DESC");
            sendJson(mapId($stmt->fetchAll()));
        } elseif ($method === 'POST') {
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO students (firstName, lastName, level, phone, classType, totalPayable, amountPaid, debt, status, termId, receiptUrl, hasBook, bookName, bookPrice, hasInterview, hasDiscount, discountPercent, discountAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['level'] ?? '',
                $input['phone'] ?? null,
                $input['classType'] ?? 'Ø­Ø¶ÙˆØ±ÛŒ',
                (int)($input['totalPayable'] ?? 0),
                (int)($input['amountPaid'] ?? 0),
                (int)($input['debt'] ?? 0),
                $input['status'] ?? 'unpaid',
                $input['termId'] ?? '',
                $input['receiptUrl'] ?? null,
                !empty($input['hasBook']) ? 1 : 0,
                $input['bookName'] ?? null,
                (int)($input['bookPrice'] ?? 0),
                !empty($input['hasInterview']) ? 1 : 0,
                !empty($input['hasDiscount']) ? 1 : 0,
                (int)($input['discountPercent'] ?? 0),
                (int)($input['discountAmount'] ?? 0)
            ]);
            $insertId = (string)$pdo->lastInsertId();
            $input['_id'] = $insertId;
            $input['id'] = $insertId;
            sendJson($input);
        } elseif ($method === 'PATCH') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $input = getJsonInput();

            $stmtSelect = $pdo->prepare("SELECT totalPayable FROM students WHERE id = ?");
            $stmtSelect->execute([$id]);
            $student = $stmtSelect->fetch();
            if (!$student) sendJson(['error' => 'Student not found'], 404);

            // Ø§Ú¯Ø± Ø´Ù‡Ø±ÛŒÙ‡ Ú©Ù„ Ø¬Ø¯ÛŒØ¯ÛŒ Ø§Ø² Ø³Ù…Øª Ú©Ø§Ø±Ø¨Ø± Ø¢Ù…Ø¯ Ø§Ø² Ø¢Ù† Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ù†ØŒ Ø¯Ø± ØºÛŒØ± Ø§ÛŒÙ†ØµÙˆØ±Øª Ø´Ù‡Ø±ÛŒÙ‡ Ù‚Ø¨Ù„ÛŒ
            $totalPayable = isset($input['totalPayable']) ? (int)$input['totalPayable'] : (int)$student['totalPayable'];
            $amountPaid = (int)($input['amountPaid'] ?? 0);
            $debt = $totalPayable - $amountPaid;
            $status = $debt <= 0 ? 'paid' : 'unpaid';
            $receiptUrl = $input['receiptUrl'] ?? null;

            $stmt = $pdo->prepare("UPDATE students SET 
                amountPaid = ?, 
                debt = ?, 
                status = ?, 
                totalPayable = ?,
                hasBook = COALESCE(?, hasBook),
                bookName = COALESCE(?, bookName),
                bookPrice = COALESCE(?, bookPrice),
                hasInterview = COALESCE(?, hasInterview),
                hasDiscount = COALESCE(?, hasDiscount),
                discountPercent = COALESCE(?, discountPercent),
                discountAmount = COALESCE(?, discountAmount),
                receiptUrl = COALESCE(?, receiptUrl) 
                WHERE id = ?");
                
            $stmt->execute([
                $amountPaid, 
                $debt, 
                $status, 
                $totalPayable,
                isset($input['hasBook']) ? ($input['hasBook'] ? 1 : 0) : null,
                $input['bookName'] ?? null,
                isset($input['bookPrice']) ? (int)$input['bookPrice'] : null,
                isset($input['hasInterview']) ? ($input['hasInterview'] ? 1 : 0) : null,
                isset($input['hasDiscount']) ? ($input['hasDiscount'] ? 1 : 0) : null,
                isset($input['discountPercent']) ? (int)$input['discountPercent'] : null,
                isset($input['discountAmount']) ? (int)$input['discountAmount'] : null,
                $receiptUrl, 
                $id
            ]);
            sendJson(['success' => true, 'debt' => $debt, 'status' => $status]);
        } elseif ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }
        break;

    // 5. Ø§ÙØ²ÙˆØ¯Ù† Ø¯Ø³ØªÙ‡â€ŒØ¬Ù…Ø¹ÛŒ Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ²Ø§Ù†
    case 'students_batch':
        if ($method !== 'POST') sendJson(['error' => 'Method Not Allowed'], 405);
        $students = getJsonInput();
        if (!is_array($students)) sendJson(['error' => 'Expected array'], 400);

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("INSERT INTO students (firstName, lastName, level, phone, classType, totalPayable, amountPaid, debt, status, termId, receiptUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($students as $s) {
                $stmt->execute([
                    $s['firstName'] ?? '',
                    $s['lastName'] ?? '',
                    $s['level'] ?? '',
                    $s['phone'] ?? null,
                    $s['classType'] ?? 'Ø­Ø¶ÙˆØ±ÛŒ',
                    (int)($s['totalPayable'] ?? 0),
                    (int)($s['amountPaid'] ?? 0),
                    (int)($s['debt'] ?? 0),
                    $s['status'] ?? 'unpaid',
                    $s['termId'] ?? '',
                    $s['receiptUrl'] ?? null
                ]);
            }
            $pdo->commit();
            sendJson(['success' => true, 'count' => count($students)]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    // 6. ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª ØªØ³ÙˆÛŒÙ‡ Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ²
    case 'students_status':
        if ($method !== 'PATCH' || !$id) sendJson(['error' => 'Invalid Request'], 400);
        $input = getJsonInput();
        $status = $input['status'] ?? 'paid';

        $stmt = $pdo->prepare("UPDATE students SET status = ?, amountPaid = totalPayable, debt = 0 WHERE id = ?");
        $stmt->execute([$status, $id]);
        sendJson(['success' => true]);
        break;

    // 7. Ø­Ù‚ÙˆÙ‚ Ùˆ Ø¯Ø³ØªÙ…Ø²Ø¯ Ø§Ø³Ø§ØªÛŒØ¯
    case 'salaries':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM salaries ORDER BY createdAt DESC");
            sendJson(mapId($stmt->fetchAll()));
        } elseif ($method === 'POST') {
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO salaries (teacherName, amount, month, status, termId, receiptUrl) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['teacherName'] ?? '',
                (int)($input['amount'] ?? 0),
                $input['month'] ?? '',
                $input['status'] ?? 'unpaid',
                $input['termId'] ?? '',
                $input['receiptUrl'] ?? null
            ]);
            $insertId = (string)$pdo->lastInsertId();
            $input['_id'] = $insertId;
            $input['id'] = $insertId;
            sendJson($input);
        } elseif ($method === 'PATCH') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE salaries SET teacherName = COALESCE(?, teacherName), amount = COALESCE(?, amount), month = COALESCE(?, month), status = COALESCE(?, status), termId = COALESCE(?, termId), receiptUrl = COALESCE(?, receiptUrl) WHERE id = ?");
            $stmt->execute([
                $input['teacherName'] ?? null,
                isset($input['amount']) ? (int)$input['amount'] : null,
                $input['month'] ?? null,
                $input['status'] ?? null,
                $input['termId'] ?? null,
                $input['receiptUrl'] ?? null,
                $id
            ]);
            sendJson(['success' => true]);
        } elseif ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $stmt = $pdo->prepare("DELETE FROM salaries WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }
        break;

    // 8. Ù‡Ø²ÛŒÙ†Ù‡â€ŒÙ‡Ø§ÛŒ Ø¬Ø§Ø±ÛŒ
    case 'expenses':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM expenses ORDER BY createdAt DESC");
            sendJson(mapId($stmt->fetchAll()));
        } elseif ($method === 'POST') {
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO expenses (title, amount, category, date, termId, receiptUrl) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['title'] ?? '',
                (int)($input['amount'] ?? 0),
                $input['category'] ?? 'Ø¹Ù…ÙˆÙ…ÛŒ',
                $input['date'] ?? '',
                $input['termId'] ?? '',
                $input['receiptUrl'] ?? null
            ]);
            $insertId = (string)$pdo->lastInsertId();
            $input['_id'] = $insertId;
            $input['id'] = $insertId;
            sendJson($input);
        } elseif ($method === 'PATCH') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $input = getJsonInput();
            $stmt = $pdo->prepare("UPDATE expenses SET title = COALESCE(?, title), amount = COALESCE(?, amount), category = COALESCE(?, category), date = COALESCE(?, date), termId = COALESCE(?, termId), receiptUrl = COALESCE(?, receiptUrl) WHERE id = ?");
            $stmt->execute([
                $input['title'] ?? null,
                isset($input['amount']) ? (int)$input['amount'] : null,
                $input['category'] ?? null,
                $input['date'] ?? null,
                $input['termId'] ?? null,
                $input['receiptUrl'] ?? null,
                $id
            ]);
            sendJson(['success' => true]);
        } elseif ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }
        break;

    // 9. Ø³Ø·ÙˆØ­ ØªØ­ØµÛŒÙ„ÛŒ
    case 'levels':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM levels");
            sendJson(mapId($stmt->fetchAll()));
        } elseif ($method === 'POST') {
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO levels (name, fee) VALUES (?, ?)");
            $stmt->execute([
                $input['name'] ?? '',
                (int)($input['fee'] ?? 0)
            ]);
            $insertId = (string)$pdo->lastInsertId();
            $input['_id'] = $insertId;
            $input['id'] = $insertId;
            sendJson($input);
        } elseif ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'ID required'], 400);
            $stmt = $pdo->prepare("DELETE FROM levels WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }
        break;

    // 10. Ø±Ø³ÛŒØ¯Ù‡Ø§ÛŒ Ú†Ø§Ù¾ÛŒ Ø²Ø¨Ø§Ù†â€ŒØ¢Ù…ÙˆØ²Ø§Ù†
    case 'receipts':
        if ($method === 'GET') {
            // Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² $id Ú©Ù‡ ØªÙˆØ³Ø· URL Rewrite ØªÙˆÙ„ÛŒØ¯ Ø´Ø¯Ù‡ Ø§Ø³Øª
            $studentId = $_GET['studentId'] ?? $id; 
            
            if ($studentId) {
                $stmt = $pdo->prepare("SELECT * FROM receipts WHERE studentId = ? ORDER BY createdAt DESC");
                $stmt->execute([$studentId]);
            } else {
                $stmt = $pdo->query("SELECT * FROM receipts ORDER BY createdAt DESC");
            }
            sendJson(mapId($stmt->fetchAll()));
        } elseif ($method === 'POST') {
            $input = getJsonInput();
            $stmt = $pdo->prepare("INSERT INTO receipts (studentId, termId, paidAmount, date) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $input['studentId'] ?? '',
                $input['termId'] ?? '',
                (int)($input['paidAmount'] ?? 0),
                $input['date'] ?? ''
            ]);
            sendJson(['success' => true, 'id' => (string)$pdo->lastInsertId()]);
        }
        break;
    // 7.5 افزودن دسته‌جمعی حقوق و دستمزد (از طریق اکسل)
    case 'salaries_batch':
        if ($method !== 'POST') sendJson(['error' => 'Method Not Allowed'], 405);
        $salariesInput = getJsonInput();
        if (!is_array($salariesInput)) sendJson(['error' => 'Expected array'], 400);

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("INSERT INTO salaries (teacherName, role, amount, month, status, termId, receiptUrl) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($salariesInput as $sal) {
                $stmt->execute([
                    $sal['teacherName'] ?? '',
                    'استاد', // Role is hardcoded to 'استاد'
                    (int)($sal['amount'] ?? 0),
                    $sal['month'] ?? '',
                    $sal['status'] ?? 'unpaid',
                    $sal['termId'] ?? '',
                    $sal['receiptUrl'] ?? null
                ]);
            }
            $pdo->commit();
            sendJson(['success' => true, 'count' => count($salariesInput)]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    default:
        sendJson(['error' => 'Invalid action endpoint'], 404);
        break;
}

