<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowBalanceAlert extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public float $currentBalance) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->error()
                    ->subject('💳 Critical: Low Cloud Credit Balance')
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('Your account balance has dropped below the safety threshold.')
                    ->line('Current Balance: ₱' . number_format($this->currentBalance, 2))
                    ->line('To prevent interruption of your live infrastructure nodes, please top up your account immediately.')
                    ->action('Recharge Balance', route('billing.index'))
                    ->line('If your balance reaches zero, active instances may be automatically suspended.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'event' => 'billing.low_balance',
            'balance' => $this->currentBalance,
            'message' => "Your cloud credit balance is low (₱" . number_format($this->currentBalance, 2) . "). Please recharge to avoid node suspension.",
        ];
    }

}
