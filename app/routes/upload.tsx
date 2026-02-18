import { type FormEvent, useState } from 'react';
import React from 'react';
import Navbar from '~/components/Navbar';
import FileUploader from '~/components/FileUploader';
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/util";
import {prepareInstructions} from "../../constants";

function Upload(props) {
  const {auth, isLoading, fs, ai, kv} = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [statusText, setStatusText] = React.useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }:{companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
    setIsProcessing(true);
    setStatusText('Uploading file...');
    const uploadedFile = await fs.upload([file]);

    if(!uploadedFile) return setStatusText('No file uploaded');

    setStatusText('Converting to image...');
    const imageFile = await convertPdfToImage(file);
    if (!imageFile) return setStatusText("Could not convert to image");

    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file])
    if (!uploadedImage) return setStatusText("Could not upload image");

    setStatusText("Preparing image...");

    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName: companyName,
      jobTitle: jobTitle,
      jobDescription: jobDescription,
      feedback: ''
    }
    await kv.set(`resume:${ uuid }`, JSON.stringify(data));

    setStatusText('Processing...');

    const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({jobTitle, jobDescription})
    )
    if (!feedback) return setStatusText('Could not analyze resume');

    const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text

    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${ uuid }`, JSON.stringify(data));
    setStatusText('Resume processing complete! Redirecting...');
  }
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if(!form) return;
    const formData = new FormData(form);

    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if(!file) return;

    handleAnalyze({companyName, jobTitle, jobDescription, file})
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main">
        <div className="page-heading">
          <h1>Make your dream resume to get your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full"/>
            </>
          ) : (
              <h2>Upload your resume to recieve an ATS score and other feedback</h2>
              )}
          {!isProcessing && (
            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name="company-name" id="company-name" placeholder="Enter your company name." />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name="job-title" id="job-title" placeholder="Enter your job title." />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={5} name="job-description" id="job-description" placeholder="Enter your job description." />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Start Analysis
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default Upload;