'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, TestTube, Stethoscope } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { analyzePrescription, type AnalyzePrescriptionOutput } from '@/ai/flows/analyze-prescription';
import { analyzeLabResults, type AnalyzeLabResultsOutput } from '@/ai/flows/analyze-lab-results';
import { BotIcon } from '@/components/icons';

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const MarkdownResult = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                a: ({ node, ...props }) => (
                    <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-accent hover:underline"
                    />
                ),
                p: ({ node, ...props }) => (
                    <p {...props} className="mb-2 last:mb-0" />
                ),
                ul: ({ node, ...props }) => (
                    <ul {...props} className="list-disc list-inside space-y-1" />
                ),
                ol: ({ node, ...props }) => (
                    <ol {...props} className="list-decimal list-inside space-y-1" />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
};


export default function AnalysisPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    // Prescription State
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [prescriptionResult, setPrescriptionResult] = useState<AnalyzePrescriptionOutput | null>(null);

    // Lab Results State
    const [labFile, setLabFile] = useState<File | null>(null);
    const [labResult, setLabResult] = useState<AnalyzeLabResultsOutput | null>(null);

    const handlePrescriptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prescriptionFile) {
            toast({ variant: 'destructive', title: 'No file selected', description: 'Please select an image or PDF of your prescription.' });
            return;
        }
        setIsLoading(true);
        setPrescriptionResult(null);
        try {
            const photoDataUri = await fileToDataUri(prescriptionFile);
            const result = await analyzePrescription({ photoDataUri });
            setPrescriptionResult(result);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the prescription. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLabSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!labFile) {
            toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a file with your lab results.' });
            return;
        }
        setIsLoading(true);
        setLabResult(null);
        try {
            const fileDataUri = await fileToDataUri(labFile);
            const result = await analyzeLabResults({ fileDataUri });
            setLabResult(result);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the lab results. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Chat</span>
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <BotIcon className="h-8 w-8 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                            Analysis Tools
                        </h1>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">
                <Tabs defaultValue="prescription" className="mx-auto w-full max-w-3xl">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="prescription">
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Prescription Analysis
                        </TabsTrigger>
                        <TabsTrigger value="lab">
                            <TestTube className="mr-2 h-4 w-4" />
                            Lab Results Analysis
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="prescription">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analyze Prescription</CardTitle>
                                <CardDescription>Upload an image or PDF of your prescription to get an AI-powered analysis of medications, dosages, and potential interactions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="prescription-file">Prescription File</Label>
                                        <Input 
                                            id="prescription-file" 
                                            type="file" 
                                            accept="image/png, image/jpeg, image/jpg, application/pdf"
                                            onChange={(e) => setPrescriptionFile(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isLoading || !prescriptionFile}>
                                        {isLoading ? 'Analyzing...' : 'Analyze Prescription'}
                                        <Upload className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                                {prescriptionResult && (
                                     <Card className="mt-6 bg-muted/50">
                                        <CardHeader>
                                            <CardTitle>Analysis Result</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 text-sm">
                                            <div>
                                                <h3 className="font-semibold text-base mb-2">Detailed Analysis</h3>
                                                <MarkdownResult content={prescriptionResult.analysis} />
                                            </div>
                                            <div className="border-t my-4" />
                                            <div>
                                                <h3 className="font-semibold text-base mb-2">Suggested Exercises</h3>
                                                <MarkdownResult content={prescriptionResult.exercises} />
                                            </div>
                                             <div className="border-t my-4" />
                                            <div>
                                                <h3 className="font-semibold text-base mb-2">Suggested Home Remedies</h3>
                                                <MarkdownResult content={prescriptionResult.homeRemedies} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="lab">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analyze Lab Results</CardTitle>
                                <CardDescription>Upload a file (image or PDF) of your lab results to get an AI-powered summary of any values that are outside the normal range.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <form onSubmit={handleLabSubmit} className="space-y-4">
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="lab-file">Lab Results File</Label>
                                        <Input 
                                            id="lab-file" 
                                            type="file" 
                                            accept="image/png, image/jpeg, image/jpg, application/pdf"
                                            onChange={(e) => setLabFile(e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                    <Button type="submit" disabled={isLoading || !labFile}>
                                        {isLoading ? 'Analyzing...' : 'Analyze Lab Results'}
                                        <TestTube className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                                {labResult && (
                                     <Card className="mt-6 bg-muted/50">
                                        <CardHeader>
                                            <CardTitle>Analysis Result</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <MarkdownResult content={labResult.summary} />
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
