import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Mail, MapPin, Calendar } from "lucide-react"
import { Link } from "react-router-dom"

export default function Privacy() {
  const effectiveDate = "July 9, 2026"

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button
          variant="ghost"
          asChild
          className="mb-4 gap-2"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold mb-4 text-primary">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            This page is maintained by Christ in you (Light Embassy Church) to explain how we collect, use, and protect your personal information in the Light Embassy app.
          </p>
          <a
            href="/privacy-policy.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
          >
            View plain-text version
          </a>
        </div>

        <Card className="mb-6 border-primary/10 shadow-gentle">
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Data controller</p>
                  <p>Christ in you (Light Embassy Church)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Address</p>
                  <p>Sunnanväg 18L, 222 26 Lund, Sweden</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Contact</p>
                  <p>pete@lightembassy.org</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Effective date</p>
                  <p>{effectiveDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Light Embassy (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a Christian community app operated by Christ in you (Light Embassy Church). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, who we share it with, and the rights you have over your information when you use our iOS, Android, and web applications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly, data generated through your use of the app, and limited technical data necessary to operate the service.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account information:</strong> email address, password (stored in hashed form), and username.</li>
              <li><strong>Profile information:</strong> any optional details you add to your profile, such as a display name or profile photo.</li>
              <li><strong>Prayer requests:</strong> titles, descriptions, categories, and optional contact details (name, email, phone) if you request pastoral counselling. You may also submit anonymously.</li>
              <li><strong>Community content:</strong> forum posts, comments, messages sent through the in-app messaging feature, and chatbot conversations.</li>
              <li><strong>Activity data:</strong> media history (videos watched, podcasts listened to), quiz responses and scores, achievements, streaks, and feature usage.</li>
              <li><strong>Device and technical data:</strong> push notification token, device type, operating system, app version, and crash logs.</li>
              <li><strong>Location data:</strong> approximate location only when you explicitly allow it, used to find nearby radio stations. You can disable this at any time in your device settings.</li>
              <li><strong>Camera/photos:</strong> images you choose to upload using the device camera or photo library. We do not access the camera without your permission.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your personal data to provide, maintain, and improve the Light Embassy experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create and manage your account.</li>
              <li>Deliver content such as sermons, podcasts, Bible study materials, and live radio.</li>
              <li>Process and display prayer requests and community forum posts.</li>
              <li>Enable messaging between you and the Light Embassy team.</li>
              <li>Track progress, streaks, achievements, and quiz history for personalization.</li>
              <li>Send push notifications, devotional reminders, and important service updates (with your consent where required).</li>
              <li>Respond to pastoral counselling requests when contact details are provided.</li>
              <li>Maintain security, prevent abuse, and troubleshoot technical issues.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed">
              For users in the European Economic Area and United Kingdom, we process personal data on the following legal bases: (a) <strong>performance of a contract</strong> when providing account-based services; (b) <strong>consent</strong> for optional features such as push notifications, location access, camera access, and marketing communications; (c) <strong>legitimate interests</strong> in maintaining security, improving the app, and preventing misuse; and (d) <strong>legal obligations</strong> where required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">5. Data Sharing and Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal data. We share information only with trusted service providers and when legally necessary:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Lovable Cloud / backend services:</strong> used to host and secure account data, content, and messaging infrastructure.</li>
              <li><strong>Google:</strong> used for sign-in authentication and for serving YouTube video content.</li>
              <li><strong>Podbean:</strong> used to stream and display podcast episodes.</li>
              <li><strong>Mapbox:</strong> used to display church locations and regional radio stations.</li>
              <li><strong>Analytics and crash reporting providers:</strong> used to understand app usage and fix errors.</li>
              <li><strong>Law enforcement or regulators:</strong> when required by law or to protect our rights and users.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">6. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some of our service providers may process data outside the European Economic Area. When this occurs, we rely on appropriate safeguards such as Standard Contractual Clauses or equivalent transfer mechanisms approved under GDPR to protect your personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">7. Data Retention and Deletion</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We keep your personal data only as long as necessary to provide the service or as required by law. Account information is retained while your account is active.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>How to request deletion:</strong> To delete your account and associated personal data, contact us at pete@lightembassy.org with the subject line &ldquo;Account Deletion Request.&rdquo; We will verify your identity and process the deletion within 30 days. After deletion, your personal data will be removed or anonymized, except where retention is necessary for legal, security, or fraud-prevention purposes. Anonymous prayer requests and forum posts may remain visible after account deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> ask us to correct inaccurate or incomplete data.</li>
              <li><strong>Erasure:</strong> request deletion of your personal data in certain circumstances.</li>
              <li><strong>Restriction:</strong> ask us to limit processing of your data.</li>
              <li><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> object to processing based on legitimate interests or direct marketing.</li>
              <li><strong>Withdraw consent:</strong> withdraw consent for optional processing at any time.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise your rights, contact us at pete@lightembassy.org. We will respond within the timeframes required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">9. California Privacy Rights (CCPA/CPRA)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are a California resident, you have specific rights under the California Consumer Privacy Act and California Privacy Rights Act:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Right to know:</strong> request details about the personal information we collect, use, and disclose.</li>
              <li><strong>Right to delete:</strong> request deletion of your personal information, subject to certain exceptions.</li>
              <li><strong>Right to correct:</strong> request correction of inaccurate personal information.</li>
              <li><strong>Right to opt out:</strong> we do not sell or share personal information for cross-context behavioral advertising.</li>
              <li><strong>Right to non-discrimination:</strong> we will not discriminate against you for exercising your privacy rights.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              California residents may contact us at pete@lightembassy.org to exercise these rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Light Embassy is a family-friendly app, and children are welcome to use it under appropriate supervision. We do not knowingly collect personal data from children under 13 without verifiable parental consent. If you believe we have collected information from a child under 13 without consent, please contact us at pete@lightembassy.org and we will promptly delete the information. Parents and guardians may also contact us to review, modify, or delete information associated with a minor&apos;s account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">11. Cookies and Similar Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our web app may use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the app is used. You can manage cookie preferences through your browser settings. Mobile apps use equivalent local storage and device identifiers for similar purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">12. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include encryption in transit, access controls, hashed passwords, and regular security reviews. No online service can guarantee absolute security, so we encourage you to use a strong password and keep your device secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">13. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we make material changes, we will update the effective date at the top of this page and notify users through the app or by email where appropriate. Your continued use of Light Embassy after the changes take effect constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions, concerns, or requests about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg text-muted-foreground">
              <p><strong>Christ in you (Light Embassy Church)</strong></p>
              <p>Sunnanväg 18L, 222 26 Lund, Sweden</p>
              <p>Email: pete@lightembassy.org</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
