import {
    ContactLink,
    InlineLink,
    LegalList,
    LegalPage,
    LegalSection,
    Strong,
} from "@/components/legal-page";

export const metadata = {
    title: "Privacy Policy - Cobol Training",
    description: "How Cobol Training collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
    return (
        <LegalPage title="Privacy Policy" lastUpdated="September 21, 2026">
            <LegalSection title="1. Who We Are">
                <p>
                    This Privacy Policy explains how Cobol Training (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                    &ldquo;our&rdquo;), the operator of cobol-training.com (the &ldquo;Site&rdquo;), collects, uses and
                    shares your personal data when you visit the Site or use our courses and services (the
                    &ldquo;Services&rdquo;). We are the data controller for the data described below and act in line with
                    the EU General Data Protection Regulation (GDPR) and French data protection law. It should be read
                    together with our <InlineLink href="/terms">Terms and Conditions</InlineLink>.
                </p>
            </LegalSection>

            <LegalSection title="2. Information We Collect">
                <p>
                    <Strong>Information you provide to us</Strong>
                </p>
                <LegalList>
                    <li>
                        <Strong>Account:</Strong> your name, email address and password. Your password is handled by our
                        authentication provider and stored only in hashed form; we cannot read it.
                    </li>
                    <li>
                        <Strong>Learning activity:</Strong> your progress in courses, quiz answers, the exercises you
                        submit, the feedback you receive, badges and coding challenge submissions.
                    </li>
                    <li>
                        <Strong>Messages:</Strong> the text and images you exchange with your instructor through the
                        platform&apos;s messaging.
                    </li>
                    <li>
                        <Strong>Payments:</Strong> when you buy a plan, you enter your billing address and payment details
                        on the checkout page of our payment provider, Stripe. We do not receive or store your card number;
                        we keep only references to your Stripe customer and subscription, and the status of your plan.
                    </li>
                    <li>
                        <Strong>Mainframe access:</Strong> the Mainframe (TSO) credentials we assign to you so you can
                        practice on our environment.
                    </li>
                    <li>
                        <Strong>Contact:</Strong> your email address and whatever you choose to tell us when you write to us.
                    </li>
                </LegalList>
                <p>
                    <Strong>Information collected automatically</Strong>
                </p>
                <LegalList>
                    <li>
                        <Strong>Sign-in records:</Strong> each time you sign in, we record your IP address, the country
                        derived from it, and the date and time of the sign-in.
                    </li>
                    <li>
                        <Strong>Technical data:</Strong> like any website, our hosting infrastructure processes your IP
                        address, browser type and operating system to deliver pages and keep the Site secure.
                    </li>
                    <li>
                        <Strong>Cookies:</Strong> see section 3.
                    </li>
                </LegalList>
                <p>We do not use third-party analytics or advertising trackers.</p>
            </LegalSection>

            <LegalSection title="3. Cookies">
                <p>We only use cookies and similar technologies that are needed for the Site to work:</p>
                <LegalList>
                    <li>
                        <Strong>Authentication:</Strong> cookies that keep you signed in to your account.
                    </li>
                    <li>
                        <Strong>Bot protection:</Strong> our sign-in, sign-up and password forms use Cloudflare Turnstile,
                        which runs a short check to tell humans from bots.
                    </li>
                    <li>
                        <Strong>Third-party services:</Strong> Stripe&apos;s checkout page, and video players embedded in
                        lessons (such as YouTube or Vimeo), may set their own cookies when you use them, under their own
                        privacy policies.
                    </li>
                </LegalList>
                <p>
                    You can set your browser to block cookies, but you will then not be able to sign in and some parts of
                    the Site will not work.
                </p>
            </LegalSection>

            <LegalSection title="4. How We Use Your Information">
                <p>We use your data for the following purposes, on the legal bases indicated:</p>
                <LegalList>
                    <li>
                        Create and manage your account, and deliver the courses, exercises, feedback, messaging and
                        mainframe access (performance of our contract with you).
                    </li>
                    <li>
                        Process payments and manage trials, subscriptions and cancellations, and meet our accounting and
                        tax obligations (contract and legal obligation).
                    </li>
                    <li>
                        Send you service emails: welcome message, sign-in and password emails, trial reminders and trial
                        end, subscription and payment notices, and mainframe access details (contract and legitimate
                        interest).
                    </li>
                    <li>
                        Send you our newsletter, which includes news and coding challenges. Your name and email address
                        are added to our email contact list for this purpose. You can unsubscribe at any time using the
                        link in each email or by writing to us (legitimate interest; you can object at any time).
                    </li>
                    <li>
                        Protect the Site and detect abuse. In particular, we use sign-in records to prevent the creation of
                        several accounts to obtain repeated free trials: a registration may be refused when the IP address
                        has already been used to sign in to an existing account. This check is automatic; if you think it
                        was a mistake, contact us and we will review it manually (legitimate interest).
                    </li>
                    <li>Provide support and answer your questions (contract and legitimate interest).</li>
                    <li>Maintain and improve the Site and our courses (legitimate interest).</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="5. Who We Share Your Information With">
                <p>
                    We do not sell, rent or trade your personal data. We share it only with the following recipients, and
                    only as needed to operate the Services:
                </p>
                <LegalList>
                    <li>
                        <Strong>Service providers (processors):</Strong> Supabase (database, authentication, file storage
                        and real-time messaging), Vercel (hosting), Stripe (payments, billing and tax calculation), Resend
                        (sending emails and managing our contact list) and Cloudflare (bot protection).
                    </li>
                    <li>
                        <Strong>Video platforms:</Strong> when you play a lesson video hosted on a third-party platform,
                        that platform receives the usual technical data of your request.
                    </li>
                    <li>
                        <Strong>Our team:</Strong> our instructors and administrators can access your account details,
                        progress, submissions, messages and sign-in records in order to run the training, give feedback and
                        keep the Site secure.
                    </li>
                    <li>
                        <Strong>Authorities:</Strong> if required by law or by a valid request from a public authority.
                    </li>
                </LegalList>
                <p>
                    Some of these providers may process data outside the European Economic Area. In that case, the transfer
                    relies on appropriate safeguards, such as the European Commission&apos;s Standard Contractual Clauses.
                </p>
            </LegalSection>

            <LegalSection title="6. How Long We Keep Your Information">
                <p>
                    We keep your account data, learning activity, messages and sign-in records for as long as your account
                    exists. When your account is deleted, this data is deleted with it. Billing and accounting records are
                    kept for the period required by law, and are also held by Stripe. Newsletter data is kept until you
                    unsubscribe.
                </p>
            </LegalSection>

            <LegalSection title="7. Data Security">
                <p>
                    The security of your data matters to us. We use measures such as encrypted connections (HTTPS), hashed
                    passwords, and access controls that limit each student to their own data. However, no method of
                    transmission over the internet or of electronic storage is 100% secure, and we cannot guarantee absolute
                    security. Please choose a strong password and keep it, and your mainframe credentials, confidential.
                </p>
            </LegalSection>

            <LegalSection title="8. Your Data Protection Rights">
                <p>Depending on where you live and applicable law, you have the right to:</p>
                <LegalList>
                    <li>
                        <Strong>Access</Strong> the personal data we hold about you and obtain a copy.
                    </li>
                    <li>
                        <Strong>Rectify</Strong> data that is inaccurate or incomplete. You can update your name and
                        password yourself in your account settings.
                    </li>
                    <li>
                        <Strong>Erase</Strong> your personal data.
                    </li>
                    <li>
                        <Strong>Restrict</Strong> the processing of your personal data.
                    </li>
                    <li>
                        <Strong>Object</Strong> to processing based on our legitimate interest, including receiving our
                        newsletter.
                    </li>
                    <li>
                        <Strong>Data portability:</Strong> receive your data in a structured, machine-readable format.
                    </li>
                    <li>
                        <Strong>Withdraw consent</Strong> at any time, where processing is based on consent.
                    </li>
                </LegalList>
                <p>
                    To exercise these rights, email us at <ContactLink />. We will reply within one month. We may need to
                    verify your identity first. Erasing your data will also close your account, and we may need to keep some
                    billing records to comply with the law. If you believe your rights are not respected, you may lodge a
                    complaint with the French data protection authority (CNIL, cnil.fr) or with the authority of the
                    country where you live.
                </p>
            </LegalSection>

            <LegalSection title="9. Children">
                <p>
                    Our Services are intended for people aged 18 or over. We do not knowingly collect data from minors. If
                    you think a minor has created an account, please contact us and we will delete it.
                </p>
            </LegalSection>

            <LegalSection title="10. Links to Other Websites">
                <p>
                    The Site may contain links to websites we do not operate. We have no control over, and assume no
                    responsibility for, the content or privacy practices of third-party sites. We encourage you to read the
                    privacy policy of every site you visit.
                </p>
            </LegalSection>

            <LegalSection title="11. Changes to This Privacy Policy">
                <p>
                    We may update this Privacy Policy from time to time. When we do, we will post the new version on this
                    page and update the &ldquo;Last updated&rdquo; date above. We encourage you to review it periodically.
                </p>
            </LegalSection>

            <LegalSection title="12. Contact Us">
                <p>If you have any questions about this Privacy Policy or about your data, please contact us:</p>
                <LegalList>
                    <li>
                        Email: <ContactLink />
                    </li>
                    <li>Website: cobol-training.com</li>
                </LegalList>
            </LegalSection>
        </LegalPage>
    );
}
