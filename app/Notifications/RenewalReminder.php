<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RenewalReminder extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public \App\Models\Instance $instance, public int $daysLeft) {}

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
                    ->subject('⌛ Renewal Notice: ' . $this->instance->name)
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('This is a reminder that your cloud instance subscription is approaching its expiration date.')
                    ->line('Node Name: ' . $this->instance->name)
                    ->line('Time Remaining: ' . $this->daysLeft . ' days')
                    ->line('Ensure you have enough cloud credits in your account for automatic renewal, or manually extend your subscription.')
                    ->action('Manage Instance', route('instances.show', $this->instance->id))
                    ->line('Active instances with expired orders will be automatically de-provisioned.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'instance_id' => $this->instance->id,
            'event' => 'instance.renewal_reminder',
            'days_left' => $this->daysLeft,
            'message' => "Reminder: '{$this->instance->name}' will expire in {$this->daysLeft} days. Check your credit balance for automatic renewal.",
        ];
    }

}
