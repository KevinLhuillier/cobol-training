<?php

namespace App\Http\Controllers;

use App\Mail\TestMail;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    public function sendTestMail()
    {
        Mail::to('endperform@outlook.fr')->send(new TestMail());
        return redirect()->back()->with('status', 'Test email sent successfully!');
    }
}
