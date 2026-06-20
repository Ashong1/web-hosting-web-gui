<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\TicketReplied;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with('user')->latest();

        if (!$request->user()->hasAdminRole()) {
            $query->where('user_id', $request->user()->id);
        }

        return Inertia::render('Support/Index', [
            'tickets' => $query->paginate(15)
        ]);
    }

    public function show(Ticket $ticket)
    {
        if (!auth()->user()->hasAdminRole() && $ticket->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Support/Show', [
            'ticket' => $ticket->load(['user', 'messages.user']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'priority' => 'required|in:low,medium,high,critical',
            'message' => 'required|string',
        ]);

        $ticket = $request->user()->tickets()->create([
            'subject' => $validated['subject'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        $ticket->messages()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'is_admin_reply' => false,
        ]);

        AuditLog::log('support.ticket_created', $ticket);

        return redirect()->route('support.show', $ticket->id)->with('message', 'Support ticket created.');
    }

    public function reply(Request $request, Ticket $ticket)
    {
        if (!auth()->user()->hasAdminRole() && $ticket->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $isAdminReply = auth()->user()->hasAdminRole();

        $message = $ticket->messages()->create([
            'user_id' => auth()->id(),
            'message' => $validated['message'],
            'is_admin_reply' => $isAdminReply,
        ]);

        if ($isAdminReply) {
            $ticket->update(['status' => 'in_progress']);
            AuditLog::log('support.admin_reply', $ticket);
            
            // Notify the user
            $ticket->user->notify(new TicketReplied($ticket, $message));
        } else {
            $ticket->update(['status' => 'open']);
            AuditLog::log('support.user_reply', $ticket);

            // Notify support staff
            $admins = User::whereIn('role', [User::ROLE_ROOT, User::ROLE_SUPPORT])->get();
            Notification::send($admins, new TicketReplied($ticket, $message));
        }

        return back()->with('message', 'Reply transmitted.');
    }

    public function close(Ticket $ticket)
    {
        if (!auth()->user()->hasAdminRole() && $ticket->user_id !== auth()->id()) {
            abort(403);
        }

        $ticket->update(['status' => 'closed']);

        AuditLog::log('support.ticket_closed', $ticket);

        return back()->with('message', 'Ticket closed.');
    }
}
