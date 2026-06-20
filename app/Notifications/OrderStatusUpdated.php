<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Order $order) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $status = ucfirst($this->order->status);
        $message = "Your order #{$this->order->id} for {$this->order->plan_name} has been {$status}.";

        if ($this->order->status === 'rejected') {
            $message .= " Reason: " . $this->order->admin_notes;
        }

        return (new MailMessage)
                    ->subject("Order Update: #{$this->order->id} {$status}")
                    ->line($message)
                    ->action('View Orders', route('orders.index'))
                    ->line('Thank you for choosing Aserotech.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'status' => $this->order->status,
            'plan' => $this->order->plan_name,
            'message' => "Order #{$this->order->id} ({$this->order->plan_name}) status updated to: " . $this->order->status,
        ];
    }
}
