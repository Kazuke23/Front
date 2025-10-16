import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormField } from './form-field.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrls: ['./form.css']
})
export class FormComponent implements OnChanges {
  @Input() fields: FormField[] = [];
  @Output() submitForm = new EventEmitter<any>();

  form: FormGroup = new FormGroup({});
  private fb: FormBuilder; // ✅ declaración segura

  constructor(formBuilder: FormBuilder) {
    this.fb = formBuilder; // ✅ inicialización
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      this.createForm();
    }
  }

  private createForm() {
    const group: { [key: string]: any } = {};
    this.fields.forEach(field => {
      group[field.name] = field.required ? ['', Validators.required] : [''];
    });
    this.form = this.fb.group(group); // ✅ ahora fb ya está inicializado correctamente
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitForm.emit(this.form.value);
      console.log('Formulario enviado:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
