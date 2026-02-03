import { type FormEvent, useState } from 'react';
import React from 'react';
import Navbar from '~/components/Navbar';
import FileUploader from '~/components/FileUploader';

function Upload(props) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [statusText, setStatusText] = React.useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if(!form) return;
    const formData = new FormData(form);

    const companyName = formData.get('company-name');
    const jobTitle = formData.get('job-title');
    const jobDescription = formData.get('job-description');
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