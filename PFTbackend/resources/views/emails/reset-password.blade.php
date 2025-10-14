<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Helvetica', Arial, sans-serif;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            position: relative;
        }

        /* Glassmorphism effect */
        .email-card {
            position: relative;
            background: rgba(255, 255, 255, 0.90);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            border: 1px solid rgba(16, 185, 129, 0.1);
            box-shadow:
                0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
            padding: 48px 40px;
            overflow: hidden;
        }

        /* Gradient backdrop blur effect */
        .email-card::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg,
                    rgba(16, 185, 129, 0.3) 0%,
                    rgba(34, 197, 94, 0.2) 25%,
                    rgba(59, 130, 246, 0.2) 75%,
                    rgba(168, 85, 247, 0.2) 100%);
            border-radius: 25px;
            z-index: -1;
            filter: blur(8px);
            opacity: 0.4;
        }

        /* Header with icon */
        .header {
            text-align: center;
            margin-bottom: 32px;
        }

        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10B981, #059669);
            border-radius: 20px;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            color: white;
        }

        .logo-text {
            background: linear-gradient(135deg, #10B981, #059669);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
        }

        /* Title section */
        .title {
            color: #111827;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 16px 0;
            text-align: center;
            letter-spacing: -0.5px;
        }

        .subtitle {
            color: #6B7280;
            font-size: 16px;
            font-weight: 400;
            margin: 0 0 40px 0;
            text-align: center;
            line-height: 1.6;
        }

        /* Reset button with gradient and effects */
        .reset-button-container {
            text-align: center;
            margin: 40px 0;
        }

        .reset-button {
            display: inline-block;
            position: relative;
            background: linear-gradient(135deg, #10B981, #059669);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.25px;
            box-shadow:
                0 10px 15px -3px rgba(16, 185, 129, 0.3),
                0 4px 6px -2px rgba(16, 185, 129, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .reset-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow:
                0 20px 25px -5px rgba(16, 185, 129, 0.4),
                0 10px 10px -5px rgba(16, 185, 129, 0.3);
        }

        .reset-button:hover::before {
            left: 100%;
        }

        /* Fallback URL section */
        .fallback-section {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }

        .fallback-text {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 12px;
            line-height: 1.5;
        }

        .fallback-url {
            color: #10B981;
            text-decoration: none;
            word-break: break-all;
            font-weight: 500;
            padding: 8px 12px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 6px;
            display: inline-block;
            transition: background-color 0.2s;
        }

        .fallback-url:hover {
            background: rgba(16, 185, 129, 0.15);
        }

        /* Security notice */
        .security-notice {
            background: rgba(59, 130, 246, 0.05);
            border-left: 4px solid #3B82F6;
            padding: 16px 20px;
            margin: 32px 0;
            border-radius: 0 8px 8px 0;
        }

        .security-notice p {
            color: #1E40AF;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }

        /* Footer */
        .footer {
            border-top: 1px solid rgba(229, 231, 235, 0.8);
            padding-top: 32px;
            margin-top: 40px;
            text-align: center;
        }

        .footer-text {
            color: #9CA3AF;
            font-size: 13px;
            line-height: 1.6;
            margin: 0;
        }

        .footer-brand {
            background: linear-gradient(135deg, #10B981, #059669);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 600;
        }

        /* Responsive design */
        @media (max-width: 640px) {
            body {
                padding: 20px 10px;
            }

            .email-card {
                padding: 32px 24px;
                border-radius: 16px;
            }

            .title {
                font-size: 24px;
            }

            .logo-container {
                width: 64px;
                height: 64px;
            }

            .logo-text {
                font-size: 28px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="email-card">
            <!-- Header -->
            <div class="header">
                <div class="logo-container">
                    <span style="color: white; font-size: 42px; font-weight: 700; line-height: 1;">M</span>
                </div>
                <h1 class="logo-text">MoneyTracker</h1>
            </div>

            <!-- Title -->
            <h2 class="title">Reset Your Password</h2>
            <p class="subtitle">
                You requested a password reset for your MoneyTracker account. Click the button below to create a new
                password and regain access to your financial dashboard.
            </p>

            <!-- Reset Button -->
            <div class="reset-button-container">
                <a href="{{ $url }}" class="reset-button" target="_blank">
                    Reset Password
                </a>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <p>
                    🔒 <strong>Security Notice:</strong> This link will expire in 60 minutes for your security. If you
                    didn't request this password reset, please ignore this email.
                </p>
            </div>

            <!-- Fallback URL -->
            <div class="fallback-section">
                <p class="fallback-text">
                    Button not working? Copy and paste this link into your browser:
                </p>
                <a href="{{ $url }}" class="fallback-url">{{ $url }}</a>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p class="footer-text">
                    If you have any questions, feel free to contact our support team.<br>
                    Thank you for using <span class="footer-brand">MoneyTracker</span><br><br>
                    <strong>The MoneyTracker Team</strong>
                </p>
            </div>
        </div>
    </div>
</body>

</html>