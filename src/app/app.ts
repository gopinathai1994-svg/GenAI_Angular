import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private apiUrl = 'https://genai-it-troubleshooting-chatbot.onrender.com/api/chat' //'http://localhost:8000/api/chat';

  userPrompt = '';
  isLoading = false;

  stats = {
    activeDeployments: 12,
    systemHealth: '98.2%',
    pendingErrors: 3
  };

  messages: any[] = [
    { 
      sender: 'bot', 
      message: 'Ready to resolve issues? Paste your stack trace or deployment error below for instant AI debugging.',
      solution: [
        'Example 1: Angular blank screen on Azure deployment',
        'Example 2: 500 Internal Server Error on Spring Boot API'
      ]
    }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) {}
  }

  // Method to handle editing user message
  editMessage(text: string) {
    this.userPrompt = text;
  }

  sendMessage() {
    if (!this.userPrompt.trim()) return;

    const promptText = this.userPrompt;
    this.messages.push({ sender: 'user', text: promptText });
    this.userPrompt = '';
    this.isLoading = true;

    const formData = new FormData();
    formData.append('prompt', promptText);

    this.http.post<any>(this.apiUrl, formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messages.push({
          sender: 'bot',
          message: res.message,
          solution: res.solution,
          status: res.status || 'success'
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err,'err')
        this.isLoading = false;
        this.messages.push({
          sender: 'bot',
          message: 'Unable to connect to the backend server. Please verify FastAPI is running with CORS enabled.',
          solution: ['Check if uvicorn server is active at port 8000 and CORS middleware is added.'],
          status: 'error'
        });
        this.cdr.detectChanges();
      }
    });
  }
}