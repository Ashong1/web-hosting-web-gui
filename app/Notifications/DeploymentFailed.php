<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeploymentFailed extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public \App\Models\Instance $instance, public string $errorMessage) {}

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
                    ->subject('⚠️ Deployment Failed: ' . $this->instance->name)
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('Our orchestration engine encountered a critical error while attempting to synthesize your node.')
                    ->line('Node Name: ' . $this->instance->name)
                    ->line('Error Details: ' . $this->errorMessage)
                    ->line('Our engineers have been notified, but you may want to check your build configuration or Dockerfile.')
                    ->action('Debug Instance', route('instances.show', $this->instance->id))
                    ->line('If this persists, please open a support ticket.');
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
            'event' => 'deployment.failed',
            'message' => "Deployment Failed: '{$this->instance->name}' encountered an error during synthesis.",
            'error' => $this->errorMessage,
        ];
    }

}
