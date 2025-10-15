import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './pages/login/login'; // ✅ este es tu login.ts

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent], // ✅ agregas el Login aquí
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
