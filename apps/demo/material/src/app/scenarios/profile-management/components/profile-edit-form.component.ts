import { Component, output, signal } from '@angular/core';
import { DynamicForm } from '@ng-forge/dynamic-form';
import { profileEditConfig } from '../configs/profile-edit-config';

@Component({
  imports: [DynamicForm],
  selector: 'demo-profile-edit-form',
  template: ` <dynamic-form [config]="config" [value]="initialValue()" (submitted)="submitted.emit($event)" /> `,
})
export class ProfileEditFormComponent {
  submitted = output<Partial<Record<string, any>> | undefined>();
  config = profileEditConfig;

  // Realistic pre-populated profile data
  initialValue = signal({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    displayName: 'John D.',
    title: 'Software Engineer',
    phone: '+1 (555) 123-4567',
    website: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    biography: 'Passionate software engineer with 5+ years of experience in web development and cloud technologies.',
    skills: 'JavaScript, TypeScript, Angular, Node.js, AWS',
  });
}
