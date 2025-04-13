import { useMutation } from "@apollo/client";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  CreateResumeSubmissionDocument,
  GetPresignedUrlDocument,
} from "@/graphql/generated";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function SubmitResumeModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="outline"
          className="dark:bg-[#003015] bg-[#009500] h-auto text-white dark:text-foreground"
        >
          🔗{" "}
          <span className="pl-1 whitespace-normal text-start block">
            Get connected to employers in the USA for free!
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Get connected to employers in the USA for free!
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          We work with employers in the USA looking to hire Singaporean
          professionals. Tell us more about yourself and we'll get you
          connected!
        </DialogDescription>
        <SubmitResumeForm />
      </DialogContent>
    </Dialog>
  );
}

interface SubmitResumeFormValues {
  file?: File;
  name?: string;
  email?: string;
  linkedinUrl?: string;
  targetJobs?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

function SubmitResumeForm() {
  const [getPresignedUrl] = useMutation(GetPresignedUrlDocument);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createResumeSubmission, { error: createResumeSubmissionError }] =
    useMutation(CreateResumeSubmissionDocument, {
      onCompleted: () => {
        setShowSuccessMessage(true);
      },
    });

  const formik = useFormik<SubmitResumeFormValues>({
    initialValues: {},
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      linkedinUrl: Yup.string().required("LinkedIn URL is required"),
      targetJobs: Yup.string().required(
        "Please specify roles you are interested in"
      ),
      file: Yup.mixed()
        .optional()
        .test("file-size", "File size must be less than 5MB", (value) =>
          value ? (value as File).size <= MAX_FILE_SIZE : true
        ),
    }),
    onSubmit: async (values) => {
      // Clear errors first
      setShowSuccessMessage(false);
      // If a file is provided, we need to upload it to S3
      let s3key: string | undefined;
      if (values.file) {
        // Get presigned url
        const { data } = await getPresignedUrl({
          variables: { fileName: values.file!.name },
        });

        const { url, s3key: s3keyResponse } = data?.getPresignedUrl || {};
        if (!url || !s3keyResponse) {
          console.error("Failed to get presigned url");
          return;
        }
        s3key = s3keyResponse;
        // PUT request to presigned url
        const response = await fetch(url, {
          method: "PUT",
          body: values.file,
        });
        if (!response.ok) {
          console.error("Failed to upload file");
          return;
        }
        console.log("File uploaded successfully");
      }

      // Create resume submission
      await createResumeSubmission({
        variables: {
          // We know these are required because of the validation schema
          name: values.name!,
          email: values.email!,
          linkedinUrl: values.linkedinUrl!,
          s3key,
          targetJobs: values.targetJobs!,
        },
      });
    },
  });

  const {
    errors,
    handleSubmit,
    isSubmitting,
    values,
    setFieldValue,
    submitCount,
  } = formik;

  const shouldValidate = submitCount > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <FieldWithLabel label="Name*" error={errors?.name}>
        <Input
          type="text"
          value={values?.name}
          onChange={(e) =>
            setFieldValue("name", e.target.value, shouldValidate)
          }
          placeholder="John"
        />
      </FieldWithLabel>
      <FieldWithLabel label="Email*" error={errors?.email}>
        <Input
          type="email"
          value={values?.email}
          onChange={(e) =>
            setFieldValue("email", e.target.value, shouldValidate)
          }
          placeholder="john@email.com"
        />
      </FieldWithLabel>
      <FieldWithLabel
        label="Roles you are interested in*"
        error={errors?.targetJobs}
      >
        <Textarea
          placeholder="Software Engineer, DevOps, etc."
          value={values?.targetJobs}
          onChange={(e) =>
            setFieldValue("targetJobs", e.target.value, shouldValidate)
          }
        />
      </FieldWithLabel>
      <FieldWithLabel label="LinkedIn URL*" error={errors?.linkedinUrl}>
        <Input
          type="text"
          defaultValue={values?.linkedinUrl}
          onChange={(e) =>
            setFieldValue("linkedinUrl", e.target.value, shouldValidate)
          }
          placeholder="https://www.linkedin.com/in/john-doe"
        />
      </FieldWithLabel>

      <FieldWithLabel
        label="Resume"
        subtitle="Optional, but this helps us get you connected with more employers"
        error={errors?.file}
      >
        <Input
          type="file"
          onChange={(e) =>
            setFieldValue(
              "file",
              e.target.files ? e.target.files[0] : null,
              shouldValidate
            )
          }
          max={MAX_FILE_SIZE}
        />
      </FieldWithLabel>
      <Button type="submit" disabled={isSubmitting || showSuccessMessage}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
      {showSuccessMessage && !createResumeSubmissionError && (
        <p className="text-sm dark:text-green-400 text-green-700 p-2">
          Your request has been submitted! We'll get back to you soon.
        </p>
      )}
      {createResumeSubmissionError && !showSuccessMessage && (
        <p className="text-sm dark:text-red-400 text-red-700 p-2">
          We were unable to submit your request. Please try again later or drop
          us an email at{" "}
          <a
            href="mailto:hireme@h1b1.work"
            className="underline text-muted-foreground"
          >
            hireme@h1b1.work
          </a>
        </p>
      )}
    </form>
  );
}

function FieldWithLabel({
  label,
  subtitle,
  children,
  error,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="pl-0 flex justify-between">
        <div className="flex flex-col">
          <label className="text-sm font-medium">{label}</label>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-400 text-end">{error}</p>}
      </div>
      {children}
    </div>
  );
}
