<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .header {
            width: 100%;
            border-bottom: 2px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #101827;
        }
        .logo-accent {
            color: #3b82f6;
        }
        .invoice-details {
            float: right;
            text-align: right;
        }
        .billing-to {
            margin-bottom: 40px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            text-align: left;
        }
        th {
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
        }
        .total-row td {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 50px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="invoice-details">
            <h2>RECEIPT / INVOICE</h2>
            <p><strong>Order ID:</strong> ASERO-{{ str_pad($order->id, 6, '0', STR_PAD_LEFT) }}<br>
            <strong>Date:</strong> {{ $order->created_at->format('F d, Y') }}<br>
            <strong>Status:</strong> <span style="color: #10b981; text-transform: uppercase;">Paid</span></p>
        </div>
        <div class="logo">
            AseroTech<span class="logo-accent"> Cloud</span>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">
            Cloud Infrastructure Solutions<br>
            billing@aserotech.com
        </p>
        <div style="clear: both;"></div>
    </div>

    <div class="billing-to">
        <h3>Billed To:</h3>
        <p>
            <strong>{{ $order->user->name ?? 'Customer' }}</strong><br>
            {{ $order->user->email ?? '' }}
        </p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Period</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $order->plan_name }} Plan</strong><br>
                    <span style="font-size: 12px; color: #6b7280;">Cloud Hosting Subscription</span>
                </td>
                <td>1 Month</td>
                <td style="text-align: right;">₱{{ number_format($order->amount, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total Paid (PHP):</td>
                <td style="text-align: right;">₱{{ number_format($order->amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Thank you for choosing AseroTech Cloud.</p>
        <p>This is a computer-generated document. No signature is required.</p>
    </div>

</body>
</html>