import { FormConfig, NextPageEvent, PreviousPageEvent, SubmitEvent } from '@ng-forge/dynamic-form';

export const applicationConfig = {
  fields: [
    {
      key: 'basicInfoPage',
      type: 'page',
      fields: [
        {
          key: 'basicInfoTitle',
          type: 'text',
          label: 'Basic Information',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'basicInfoDescription',
          type: 'text',
          label: 'Tell us about yourself',
          col: 12,
        },
        {
          key: 'position',
          type: 'select',
          label: 'Position Applied For',
          options: [
            { value: 'frontend', label: 'Frontend Developer' },
            { value: 'backend', label: 'Backend Developer' },
            { value: 'fullstack', label: 'Full Stack Developer' },
            { value: 'designer', label: 'UI/UX Designer' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'firstName',
          type: 'input',
          label: 'First Name',
          required: true,
          col: 6,
        },
        {
          key: 'lastName',
          type: 'input',
          label: 'Last Name',
          required: true,
          col: 6,
        },
        {
          key: 'email',
          type: 'input',
          label: 'Email',
          props: { type: 'email' },
          email: true,
          required: true,
          col: 12,
        },
        {
          key: 'nextToExperienceApp',
          type: 'button',
          label: 'Next',
          event: NextPageEvent,
          props: {
            type: 'button',
          },
          col: 12,
        },
      ],
    },
    {
      key: 'experiencePage',
      type: 'page',
      fields: [
        {
          key: 'experienceBackgroundTitle',
          type: 'text',
          label: 'Experience',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'experienceBackgroundDescription',
          type: 'text',
          label: 'Your professional background',
          col: 12,
        },
        {
          key: 'experience',
          type: 'select',
          label: 'Years of Experience',
          options: [
            { value: '0-1', label: '0-1 years' },
            { value: '2-5', label: '2-5 years' },
            { value: '6-10', label: '6-10 years' },
            { value: '10+', label: '10+ years' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'skills',
          type: 'multi-checkbox',
          label: 'Technical Skills',
          options: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'typescript', label: 'TypeScript' },
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
            { value: 'nodejs', label: 'Node.js' },
          ],
          col: 12,
        },
        {
          key: 'portfolio',
          type: 'input',
          label: 'Portfolio URL',
          props: { type: 'url' },
          col: 12,
        },
        {
          key: 'previousToBasicInfo',
          type: 'button',
          label: 'Previous',
          event: PreviousPageEvent,
          props: {
            type: 'button',
          },
          col: 6,
        },
        {
          key: 'nextToAdditional',
          type: 'button',
          label: 'Next',
          event: NextPageEvent,
          props: {
            type: 'button',
          },
          col: 6,
        },
      ],
    },
    {
      key: 'additionalPage',
      type: 'page',
      fields: [
        {
          key: 'additionalTitle',
          type: 'text',
          label: 'Additional Information',
          props: {
            elementType: 'h2',
          },
          col: 12,
        },
        {
          key: 'additionalDescription',
          type: 'text',
          label: 'Final details',
          col: 12,
        },
        {
          key: 'availability',
          type: 'radio',
          label: 'Availability',
          options: [
            { value: 'immediate', label: 'Immediately' },
            { value: '2weeks', label: 'Within 2 weeks' },
            { value: '1month', label: 'Within 1 month' },
          ],
          required: true,
          col: 12,
        },
        {
          key: 'coverLetter',
          type: 'textarea',
          label: 'Cover Letter',
          props: { rows: 6 },
          col: 12,
        },
        {
          key: 'previousToExperienceApp',
          type: 'button',
          label: 'Previous',
          event: PreviousPageEvent,
          props: {
            type: 'button',
          },
          col: 6,
        },
        {
          key: 'submitApplication',
          type: 'button',
          label: 'Submit Application',
          event: SubmitEvent,
          props: {
            type: 'submit',
          },
          col: 6,
        },
      ],
    },
  ],
} as const satisfies FormConfig;
