import {
    ContactLink,
    InlineLink,
    LegalList,
    LegalPage,
    LegalSection,
    Strong,
} from "@/components/legal-page";

export const metadata = {
    title: "Terms and Conditions - Cobol Training",
    description: "The terms governing your use of Cobol Training's website, courses and services.",
};

export default function TermsPage() {
    return (
        <LegalPage title="Terms and Conditions" lastUpdated="September 21, 2026">
            <LegalSection title="1. Introduction and Agreement to Terms">
                <p>
                    Welcome to cobol-training.com (the &ldquo;Site&rdquo;). These Terms and Conditions
                    (&ldquo;Terms&rdquo;) govern your use of our website and the services, courses,
                    exercises, mainframe environments and content offered on it (collectively, the
                    &ldquo;Services&rdquo;). The Site is owned and operated by Cobol Training
                    (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
                </p>
                <p>
                    By creating an account or using the Site and Services, you acknowledge that you have
                    read, understood and agree to be bound by these Terms. If you do not agree, you must
                    not use the Site or the Services. Our <InlineLink href="/privacy">Privacy Policy</InlineLink>{" "}
                    explains how we handle your personal data.
                </p>
            </LegalSection>

            <LegalSection title="2. User Accounts">
                <p>
                    To access the Services you need an account. Accounts may be created by you or by us on
                    your behalf, following an invitation. In both cases you agree to:
                </p>
                <LegalList>
                    <li>Provide accurate, current and complete information.</li>
                    <li>Keep your password and account credentials secure and confidential.</li>
                    <li>Take responsibility for all activity that occurs under your account.</li>
                    <li>Notify us immediately of any unauthorized use of your account.</li>
                </LegalList>
                <p>You must be at least 18 years old to create an account and purchase our Services.</p>
            </LegalSection>

            <LegalSection title="3. Free Trial, Subscriptions and Payments">
                <LegalList>
                    <li>
                        <Strong>Free trial:</Strong> new accounts
                        may benefit from a 7-day free trial. The trial ends automatically at the end of
                        that period and never converts into a paid plan without your explicit purchase.
                        Features available during the trial may be more limited than with a paid plan.
                    </li>
                    <li>
                        <Strong>Offers:</Strong> the Services are
                        sold as a monthly subscription, or as a one-time &ldquo;Lifetime&rdquo; purchase
                        that gives you permanent access to the course modules. A Lifetime purchase
                        includes Mainframe (TSO) access and personalized exercise feedback for a limited
                        period only, as stated on the offer at the time of purchase; afterwards, these
                        can be continued through the separate Mainframe + Feedback subscription. Access
                        to the course modules is not withdrawn when that period ends.
                    </li>
                    <li>
                        <Strong>Payments:</Strong> fees are due
                        as presented at the time of purchase. Payments are processed securely by our
                        third-party payment provider, Stripe; we never see or store your card details.
                    </li>
                    <li>
                        <Strong>Pricing:</Strong> we may change
                        our prices at any time. A price change never affects a purchase already
                        completed, and it applies to an existing subscription only from its next
                        renewal, after notice.
                    </li>
                    <li>
                        <Strong>Subscriptions:</Strong> a
                        subscription renews automatically at the end of each billing period until you
                        cancel it. You can cancel at any time from your account settings; the
                        cancellation takes effect at the end of the current billing period, and you keep
                        your access until then. If a payment fails, access to the Services is suspended
                        until the payment is resolved.
                    </li>
                    <li>
                        <Strong>Refunds:</Strong> we offer a full
                        refund within 14 days of purchase, provided you have not completed more than 20%
                        of the course content. To request a refund, contact us at <ContactLink />. This
                        does not affect any mandatory consumer rights you may have under the law that
                        applies to you.
                    </li>
                </LegalList>
            </LegalSection>

            <LegalSection title="4. Intellectual Property Rights">
                <p>
                    All content on the Site, including text, graphics, logos, videos, course materials,
                    exercises, code examples and software (the &ldquo;Content&rdquo;), belongs to Cobol
                    Training or its content suppliers and is protected by copyright, trademark and other
                    intellectual property laws.
                </p>
                <p>
                    Upon purchase or activation of your access, we grant you a limited, non-exclusive,
                    non-transferable license to access and view the Content for your personal,
                    non-commercial educational use only. You may not:
                </p>
                <LegalList>
                    <li>Reproduce, distribute, modify or publicly display any Content.</li>
                    <li>Resell, rent or lease the Services or the Content.</li>
                    <li>Create derivative works from the Content.</li>
                    <li>Share your account credentials, or your mainframe (TSO) credentials, with anyone else.</li>
                </LegalList>
                <p>
                    You keep ownership of the solutions and code you submit for correction. By submitting
                    them, you allow us to use them solely to review your work and provide feedback.
                </p>
            </LegalSection>

            <LegalSection title="5. Acceptable Use, including Mainframe Access">
                <p>You agree to use the Site and the Services for lawful purposes only. You must not:</p>
                <LegalList>
                    <li>Use the Site in any way that violates applicable laws or regulations.</li>
                    <li>Engage in any conduct that is fraudulent, defamatory or harmful to us or to other users.</li>
                    <li>
                        Attempt to gain unauthorized access to, interfere with, damage or disrupt the Site,
                        its servers, or any server, computer or database connected to it.
                    </li>
                    <li>Introduce viruses, trojan horses, worms or any other malicious or harmful material.</li>
                    <li>Use automated systems such as bots or spiders to access the Site, including for scraping data.</li>
                    <li>
                        Use the Mainframe (TSO) environment for anything other than learning and practicing
                        the course material, including attempting to reach other users&apos; data or to
                        bypass the limits of your account.
                    </li>
                </LegalList>
            </LegalSection>

            <LegalSection title="6. Disclaimers">
                <p>
                    The Services and all Content are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS
                    AVAILABLE&rdquo; basis, without warranties of any kind, either express or implied, to
                    the extent permitted by law.
                </p>
                <p>We do not warrant that:</p>
                <LegalList>
                    <li>
                        The Services will meet your specific requirements or produce specific outcomes
                        (for example, a job or a certification).
                    </li>
                    <li>
                        The Site or the mainframe environment will be uninterrupted, timely, secure or
                        error-free. We may run scheduled maintenance from time to time.
                    </li>
                    <li>The information and course material will be accurate, reliable or complete.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="7. Limitation of Liability">
                <p>
                    To the fullest extent permitted by law, Cobol Training and its directors, employees and
                    agents shall not be liable for any indirect, incidental, special, consequential or
                    punitive damages, including loss of profits, data, use, goodwill or other intangible
                    losses, resulting from (i) your access to, use of, or inability to access or use the
                    Services; (ii) any conduct or content of a third party on the Services; (iii) any
                    content obtained from the Services; or (iv) unauthorized access to, use or alteration
                    of your transmissions or content, whether based on warranty, contract, tort (including
                    negligence) or any other legal theory.
                </p>
                <p>
                    Nothing in these Terms excludes or limits liability that cannot be excluded or limited
                    under applicable law.
                </p>
            </LegalSection>

            <LegalSection title="8. Indemnification">
                <p>
                    To the extent permitted by law, you agree to defend, indemnify and hold harmless Cobol
                    Training, its licensors, employees, contractors, agents, officers and directors from
                    any claims, damages, losses, liabilities, costs and expenses (including reasonable
                    legal fees) arising from your use of the Services or your breach of these Terms.
                </p>
            </LegalSection>

            <LegalSection title="9. Termination">
                <p>
                    We may suspend or terminate your account and your access to the Services if you breach
                    these Terms, with or without prior notice depending on the seriousness of the breach.
                    You may stop using the Services and cancel your subscription at any time. Sections
                    that by their nature should survive termination, such as intellectual property,
                    disclaimers and limitation of liability, will continue to apply.
                </p>
            </LegalSection>

            <LegalSection title="10. Governing Law">
                <p>
                    These Terms are governed by and construed in accordance with the laws of France,
                    without regard to conflict-of-law provisions. If you are a consumer, you also benefit
                    from the mandatory consumer protection provisions of the country where you live.
                </p>
            </LegalSection>

            <LegalSection title="11. Changes to Terms">
                <p>
                    We may modify these Terms at any time. When we make significant changes, we will post
                    the new Terms on this page and update the &ldquo;Last updated&rdquo; date above. Your
                    continued use of the Site after the changes take effect constitutes your acceptance
                    of the new Terms.
                </p>
            </LegalSection>

            <LegalSection title="12. Contact Us">
                <p>
                    If you have any questions about these Terms, please contact us at <ContactLink />.
                </p>
            </LegalSection>
        </LegalPage>
    );
}
