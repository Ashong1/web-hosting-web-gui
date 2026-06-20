<x-mail::message>
# Your Instance is Live!

Hello,

Great news! Your **{{ $appName }}** instance has been successfully provisioned and is now live.

### Access Details
- **Public URL:** [https://{{ $publicUrl }}](https://{{ $publicUrl }})
- **Database User:** `{{ $credentials['db_user'] }}`
- **Database Password:** `{{ $credentials['db_pass'] }}`

### Next Steps
You can now access your application and start configuring it. If you have any issues, please reach out to our support team.

<x-mail::button :url="'https://portal.aserotech.com/dashboard'">
Go to Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
