
"use client";
import React, { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Save, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SitePage } from '@/lib/dbUtils';
import { serverGetSitePageBySlug, serverUpsertSitePage } from '@/actions/adminDataActions';
import type { Prisma } from '@prisma/client';

const pageSlugs = [
  { slug: 'about-us', defaultTitle: 'About Yellow Institute' },
  { slug: 'privacy-policy', defaultTitle: 'Privacy Policy' },
  { slug: 'terms-of-service', defaultTitle: 'Terms of Service' },
];

const generatePlaceholderContent = (slug: string): string => {
  if (slug === 'about-us') {
    return `<h1>About Yellow Institute</h1>
<p>Yellow Institute is dedicated to providing high-quality online education to learners around the globe. We believe in the power of technology to transform learning and make it accessible to everyone, everywhere.</p>
<h2>Our Mission</h2>
<p>Our mission is to empower individuals with the knowledge and skills they need to succeed in the rapidly evolving digital world. We strive to create engaging, practical, and up-to-date courses that cater to diverse learning needs.</p>
<h2>Our Vision</h2>
<p>To be a leading online learning platform recognized for its innovative teaching methods, comprehensive course offerings, and commitment to student success and lifelong learning.</p>
<h2>Our Values</h2>
<ul>
  <li><strong>Excellence:</strong> We are committed to providing high-quality educational content and a superior learning experience.</li>
  <li><strong>Accessibility:</strong> We aim to make education accessible to all, regardless of geographical location or background.</li>
  <li><strong>Innovation:</strong> We continuously explore and implement innovative teaching methodologies and technologies.</li>
  <li><strong>Community:</strong> We foster a supportive and collaborative learning community for students and educators.</li>
  <li><strong>Integrity:</strong> We operate with transparency and uphold the highest ethical standards.</li>
</ul>
<p><em>This content can be fully customized from the admin panel.</em></p>`;
  }
  if (slug === 'privacy-policy') {
    return `<h1>Privacy Policy</h1>
<p><em>Last Updated: ${new Date().toLocaleDateString()}</em></p>
<p>Welcome to Yellow Institute ("us", "we", or "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.</p>
<h2>1. Information We Collect</h2>
<p>We collect personal information that you voluntarily provide to us when you register on the Platform, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Platform or otherwise when you contact us.</p>
<p>The personal information that we collect depends on the context of your interactions with us and the Platform, the choices you make and the products and features you use. The personal information we collect may include the following: names; email addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; debit/credit card numbers (processed by a third-party payment processor); course progress; and other similar information.</p>
<h2>2. How We Use Your Information</h2>
<p>We use personal information collected via our Platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.</p>
<ul>
    <li>To facilitate account creation and logon process.</li>
    <li>To post testimonials (with your consent).</li>
    <li>Request feedback.</li>
    <li>To manage user accounts.</li>
    <li>To send administrative information to you.</li>
    <li>To protect our Services.</li>
    <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
    <li>To respond to legal requests and prevent harm.</li>
    <li>To deliver and facilitate delivery of services to the user.</li>
    <li>To respond to user inquiries/offer support to users.</li>
    <li>To send you marketing and promotional communications (if in accordance with your marketing preferences).</li>
    <li>Deliver targeted advertising to you.</li>
</ul>
<h2>3. Will Your Information Be Shared With Anyone?</h2>
<p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
<p>Specifically, we may need to process your data or share your personal information in the following situations: Business Transfers; Affiliates; Business Partners; Third-Party Service Providers.</p>
<h2>4. Cookies and Similar Technologies</h2>
<p>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice (if applicable).</p>
<h2>5. How Long Do We Keep Your Information?</h2>
<p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).</p>
<h2>6. How Do We Keep Your Information Safe?</h2>
<p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
<h2>7. Your Privacy Rights</h2>
<p>In some regions (like the EEA and UK), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability.</p>
<h2>8. Updates to This Notice</h2>
<p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.</p>
<h2>9. How Can You Contact Us About This Notice?</h2>
<p>If you have questions or comments about this notice, you may email us at [Your Contact Email Address - e.g., privacy@yellowinstitute.com] or by post to: [Your Physical Address, if applicable].</p>
<p><em>This is a template Privacy Policy and should be customized to fit your specific practices and legal requirements. Consult with a legal professional.</em></p>`;
  }
  if (slug === 'terms-of-service') {
    return `<h1>Terms of Service</h1>
<p><em>Last Updated: ${new Date().toLocaleDateString()}</em></p>
<p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Yellow Institute website and services (the "Service") operated by Yellow Institute ("us", "we", or "our").</p>
<p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.</p>
<p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>
<h2>1. Accounts</h2>
<p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
<p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
<h2>2. Intellectual Property</h2>
<p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Yellow Institute and its licensors. The Service is protected by copyright, trademark, and other laws of both [Your Country/Jurisdiction] and foreign countries.</p>
<h2>3. Links To Other Web Sites</h2>
<p>Our Service may contain links to third-party web sites or services that are not owned or controlled by Yellow Institute. Yellow Institute has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services.</p>
<h2>4. Termination</h2>
<p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
<h2>5. Limitation Of Liability</h2>
<p>In no event shall Yellow Institute, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.</p>
<h2>6. Disclaimer</h2>
<p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
<h2>7. Governing Law</h2>
<p>These Terms shall be governed and construed in accordance with the laws of [Your Country/Jurisdiction], without regard to its conflict of law provisions.</p>
<h2>8. Changes</h2>
<p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
<h2>9. Contact Us</h2>
<p>If you have any questions about these Terms, please contact us at [Your Contact Email Address - e.g., support@yellowinstitute.com].</p>
<p><em>This is a template Terms of Service and should be customized to fit your specific practices and legal requirements. Consult with a legal professional.</em></p>`;
  }
  return `<p>Content for ${slug} will appear here. Edit this in the admin panel.</p>`;
};


export default function SiteContentManagement() {
  const [selectedSlug, setSelectedSlug] = useState<string>(pageSlugs[0].slug);
  const [currentPage, setCurrentPage] = useState<SitePage | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPageContent = async () => {
      if (!selectedSlug) return;
      setIsLoading(true);
      try {
        const pageData = await serverGetSitePageBySlug(selectedSlug);
        if (pageData) {
          setCurrentPage(pageData);
          setTitle(pageData.title);
          setContent(typeof pageData.content === 'string' ? pageData.content : JSON.stringify(pageData.content) || '');
        } else {
          const defaultTitle = pageSlugs.find(p => p.slug === selectedSlug)?.defaultTitle || 'New Page';
          setTitle(defaultTitle);
          setContent(generatePlaceholderContent(selectedSlug));
          setCurrentPage(null);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: `Could not load content for ${selectedSlug}.` });
        setTitle(pageSlugs.find(p => p.slug === selectedSlug)?.defaultTitle || 'Error Loading');
        setContent(`<p>Error loading content.</p>`);
      } finally {
        setIsLoading(false);
      }
    };
    loadPageContent();
  }, [selectedSlug, toast]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedPage = await serverUpsertSitePage(selectedSlug, title, content as unknown as Prisma.JsonValue);
      setCurrentPage(updatedPage);
      toast({ title: "Content Saved", description: `Content for "${updatedPage.title}" has been updated.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message || "Could not save content." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl md:text-2xl font-headline">
          <FileText className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 text-primary" /> Site Content Management
        </CardTitle>
        <CardDescription>Edit content for static pages like About Us, Privacy Policy, and Terms of Service.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="pageSlugSelect">Select Page to Edit</Label>
            <Select value={selectedSlug} onValueChange={setSelectedSlug} disabled={isLoading || isSaving}>
              <SelectTrigger id="pageSlugSelect">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {pageSlugs.map(page => (
                  <SelectItem key={page.slug} value={page.slug}>{page.defaultTitle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading content...</p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="pageTitle">Page Title</Label>
                <Input 
                  id="pageTitle" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  disabled={isSaving}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pageContent">Page Content (HTML)</Label>
                <Textarea
                  id="pageContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter HTML content here..."
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <Info className="inline h-3 w-3 mr-1"/> You can use HTML tags for formatting.
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Content
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

    