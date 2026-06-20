<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeploymentSuccess extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public \App\Models\Instance $instance) {}

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
                    ->subject('🚀 Deployment Successful: ' . $this->instance->name)
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Your infrastructure node has been successfully synthesized and is now live.')
                    ->line('Node Name: ' . $this->instance->name)
                    ->line('Public URL: ' . $this->instance->public_url)
                    ->action('Access Dashboard', route('instances.show', $this->instance->id))
                    ->line('Thank you for using our cloud platform!');
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
            'event' => 'deployment.success',
            'message' => "Deployment Successful: '{$this->instance->name}' is now live.",
            'url' => $this->instance->public_url,
        ];
    }

}
