
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">About Yellow Institute</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Yellow Institute is dedicated to providing high-quality online education
            to learners around the globe.
          </p>
          <p>
            Our mission is to make learning accessible, engaging, and effective. We believe
            that education is a powerful tool for personal and professional growth, and
            we strive to create a platform that empowers individuals to achieve their
            learning goals.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">Our Vision</h3>
          <p>
            To be a leading online learning platform recognized for its innovative teaching
            methods, comprehensive course offerings, and commitment to student success.
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">Our Values</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Excellence in Education</li>
            <li>Accessibility for All</li>
            <li>Continuous Innovation</li>
            <li>Supportive Learning Community</li>
            <li>Integrity and Transparency</li>
          </ul>
          <p className="text-sm text-muted-foreground pt-4">
            This is a placeholder About Us page. More detailed content about our story,
            team, and impact will be added here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
