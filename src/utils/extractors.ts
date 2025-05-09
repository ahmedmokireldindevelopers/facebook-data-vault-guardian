import secureStorage, { DataRecord } from './storage';
import { toast } from "@/hooks/use-toast";

// Mock user data
const mockFriendData = [
  { id: '12345678', name: 'John Doe', mutual: 5 },
  { id: '23456789', name: 'Jane Smith', mutual: 8 },
  { id: '34567890', name: 'Bob Johnson', mutual: 3 },
  { id: '45678901', name: 'Alice Williams', mutual: 12 },
  { id: '56789012', name: 'Charlie Brown', mutual: 7 },
];

const mockMessageData = [
  { id: '78901234', name: 'Sarah Connor', messages: 342 },
  { id: '89012345', name: 'John Connor', messages: 156 },
  { id: '90123456', name: 'Kyle Reese', messages: 78 },
  { id: '01234567', name: 'Miles Dyson', messages: 43 },
];

const mockPostData = [
  { id: 'post_12345', author: '12345678', text: 'This is a post about technology', likes: 15, comments: 3 },
  { id: 'post_23456', author: '23456789', text: 'Check out my new photos!', likes: 42, comments: 7 },
  { id: 'post_34567', author: '34567890', text: 'Great day at the beach!', likes: 28, comments: 4 },
];

const mockGroupData = [
  { id: 'group_12345', name: 'Tech Enthusiasts', members: 1245 },
  { id: 'group_23456', name: 'Photography Club', members: 342 },
  { id: 'group_34567', name: 'Beach Lovers', members: 567 },
];

// Base extractor class
abstract class DataExtractor {
  protected source: string;
  protected type: string;
  protected delay = 500; // Delay between requests (ms)
  protected status: 'idle' | 'extracting' | 'complete' | 'error' = 'idle';
  protected message: string = 'Ready to extract';
  protected progress: { current: number; total: number } = { current: 0, total: 0 };
  protected isPaused: boolean = false;
  protected isStopped: boolean = false;
  protected currentIndex: number = 0;
  
  // Listeners
  private statusListeners: ((status: string) => void)[] = [];
  private progressListeners: ((progress: { current: number; total: number }) => void)[] = [];
  
  constructor(source: string, type: string) {
    this.source = source;
    this.type = type;
    
    // Load saved delay setting with proper check for Chrome API
    if (typeof window !== 'undefined' && 'chrome' in window && window.chrome?.storage?.local) {
      window.chrome.storage.local.get("extractionInterval", (data) => {
        if (data.extractionInterval) {
          this.delay = data.extractionInterval;
        }
      });
    }
  }
  
  // Get current status
  getStatus() {
    return {
      status: this.status,
      message: this.message,
      progress: this.progress
    };
  }
  
  // Set delay between requests
  setDelay(delay: number) {
    this.delay = delay;
  }
  
  // Pause extraction
  pause() {
    this.isPaused = true;
  }
  
  // Resume extraction
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.continueExtraction();
    }
  }
  
  // Stop extraction
  stop() {
    this.isStopped = true;
    this.isPaused = false;
    this.reset();
  }
  
  // Add listeners
  onStatusChange(callback: (status: string) => void) {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }
  
  onProgressChange(callback: (progress: { current: number; total: number }) => void) {
    this.progressListeners.push(callback);
    return () => {
      this.progressListeners = this.progressListeners.filter(cb => cb !== callback);
    };
  }
  
  // Update status and notify listeners
  protected updateStatus(status: 'idle' | 'extracting' | 'complete' | 'error', message: string) {
    this.status = status;
    this.message = message;
    this.notifyStatusListeners();
  }
  
  // Update progress and notify listeners
  protected updateProgress(current: number, total: number) {
    this.progress = { current, total };
    this.notifyProgressListeners();
  }
  
  // Notify status listeners
  private notifyStatusListeners() {
    this.statusListeners.forEach(callback => callback(this.status));
  }
  
  // Notify progress listeners
  private notifyProgressListeners() {
    this.progressListeners.forEach(callback => callback(this.progress));
  }
  
  // Reset state
  reset() {
    this.status = 'idle';
    this.message = 'Ready to extract';
    this.progress = { current: 0, total: 0 };
    this.currentIndex = 0;
    this.notifyStatusListeners();
    this.notifyProgressListeners();
  }
  
  // Abstract method for data extraction
  abstract extract(): Promise<void>;
  
  // Abstract method to continue extraction after pause
  protected abstract continueExtraction(): Promise<void>;
  
  // Helper method to simulate API request with rate limiting
  protected async simulateRequest<T>(mockData: T[], index: number): Promise<T> {
    // Add random delay to simulate network latency (between 300ms and 800ms)
    const randomDelay = Math.floor(Math.random() * 500) + 300;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    // Simulate request failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Request failed');
    }
    
    return mockData[index];
  }
  
  // Store extracted data
  protected async storeData(id: string, name: string | undefined, data: any) {
    const record: DataRecord = {
      id,
      name,
      source: this.source,
      type: this.type,
      extractedAt: new Date().toISOString(),
      data
    };
    
    await secureStorage.storeData(record);
  }
}

// Friends extractor
export class FriendsExtractor extends DataExtractor {
  constructor() {
    super('Facebook', 'friend');
  }
  
  async extract(): Promise<void> {
    try {
      this.updateStatus('extracting', 'Extracting friend data from Facebook...');
      this.updateProgress(0, mockFriendData.length);
      this.isPaused = false;
      this.isStopped = false;
      this.currentIndex = 0;
      
      await this.continueExtraction();
    } catch (error) {
      console.error('Error extracting friends:', error);
      this.updateStatus('error', 'Failed to extract friend data.');
      toast({
        title: "Extraction Failed",
        description: "Failed to extract friend data.",
        variant: "destructive",
      });
    }
  }
  
  protected async continueExtraction(): Promise<void> {
    try {
      let processed = this.currentIndex;
      
      for (let i = this.currentIndex; i < mockFriendData.length; i++) {
        // Check if extraction was paused or stopped
        if (this.isPaused) {
          this.currentIndex = i;
          return;
        }
        
        if (this.isStopped) {
          return;
        }
        
        try {
          // Simulate API request
          const friend = await this.simulateRequest(mockFriendData, i);
          
          // Store data
          await this.storeData(friend.id, friend.name, friend);
          
          // Update progress
          processed++;
          this.updateProgress(processed, mockFriendData.length);
        } catch (error) {
          console.error('Error processing friend:', error);
          // Continue with next friend
        }
        
        // Respect rate limit
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
      
      this.updateStatus('complete', `Successfully extracted ${processed} friends.`);
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted ${processed} friends.`,
      });
    } catch (error) {
      console.error('Error continuing friends extraction:', error);
      this.updateStatus('error', 'Failed to extract friend data.');
    }
  }
}

// Messages extractor
export class MessagesExtractor extends DataExtractor {
  constructor() {
    super('Facebook', 'message');
  }
  
  async extract(): Promise<void> {
    try {
      this.updateStatus('extracting', 'Extracting message data from Facebook...');
      this.updateProgress(0, mockMessageData.length);
      this.isPaused = false;
      this.isStopped = false;
      this.currentIndex = 0;
      
      await this.continueExtraction();
    } catch (error) {
      console.error('Error extracting messages:', error);
      this.updateStatus('error', 'Failed to extract message data.');
      toast({
        title: "Extraction Failed",
        description: "Failed to extract message data.",
        variant: "destructive",
      });
    }
  }
  
  protected async continueExtraction(): Promise<void> {
    try {
      let processed = this.currentIndex;
      
      for (let i = this.currentIndex; i < mockMessageData.length; i++) {
        // Check if extraction was paused or stopped
        if (this.isPaused) {
          this.currentIndex = i;
          return;
        }
        
        if (this.isStopped) {
          return;
        }
        
        try {
          // Simulate API request
          const message = await this.simulateRequest(mockMessageData, i);
          
          // Store data
          await this.storeData(message.id, message.name, message);
          
          // Update progress
          processed++;
          this.updateProgress(processed, mockMessageData.length);
        } catch (error) {
          console.error('Error processing message:', error);
          // Continue with next message
        }
        
        // Respect rate limit
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
      
      this.updateStatus('complete', `Successfully extracted ${processed} message threads.`);
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted ${processed} message threads.`,
      });
    } catch (error) {
      console.error('Error continuing messages extraction:', error);
      this.updateStatus('error', 'Failed to extract message data.');
    }
  }
}

// Posts extractor
export class PostsExtractor extends DataExtractor {
  constructor() {
    super('Facebook', 'post');
  }
  
  async extract(): Promise<void> {
    try {
      this.updateStatus('extracting', 'Extracting post data from Facebook...');
      this.updateProgress(0, mockPostData.length);
      this.isPaused = false;
      this.isStopped = false;
      this.currentIndex = 0;
      
      await this.continueExtraction();
    } catch (error) {
      console.error('Error extracting posts:', error);
      this.updateStatus('error', 'Failed to extract post data.');
      toast({
        title: "Extraction Failed",
        description: "Failed to extract post data.",
        variant: "destructive",
      });
    }
  }
  
  protected async continueExtraction(): Promise<void> {
    try {
      let processed = this.currentIndex;
      
      for (let i = this.currentIndex; i < mockPostData.length; i++) {
        // Check if extraction was paused or stopped
        if (this.isPaused) {
          this.currentIndex = i;
          return;
        }
        
        if (this.isStopped) {
          return;
        }
        
        try {
          // Simulate API request
          const post = await this.simulateRequest(mockPostData, i);
          
          // Store data
          await this.storeData(post.id, undefined, post);
          
          // Update progress
          processed++;
          this.updateProgress(processed, mockPostData.length);
        } catch (error) {
          console.error('Error processing post:', error);
          // Continue with next post
        }
        
        // Respect rate limit
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
      
      this.updateStatus('complete', `Successfully extracted ${processed} posts.`);
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted ${processed} posts.`,
      });
    } catch (error) {
      console.error('Error continuing posts extraction:', error);
      this.updateStatus('error', 'Failed to extract post data.');
    }
  }
}

// Groups extractor
export class GroupsExtractor extends DataExtractor {
  constructor() {
    super('Facebook', 'group');
  }
  
  async extract(): Promise<void> {
    try {
      this.updateStatus('extracting', 'Extracting group data from Facebook...');
      this.updateProgress(0, mockGroupData.length);
      this.isPaused = false;
      this.isStopped = false;
      this.currentIndex = 0;
      
      await this.continueExtraction();
    } catch (error) {
      console.error('Error extracting groups:', error);
      this.updateStatus('error', 'Failed to extract group data.');
      toast({
        title: "Extraction Failed",
        description: "Failed to extract group data.",
        variant: "destructive",
      });
    }
  }
  
  protected async continueExtraction(): Promise<void> {
    try {
      let processed = this.currentIndex;
      
      for (let i = this.currentIndex; i < mockGroupData.length; i++) {
        // Check if extraction was paused or stopped
        if (this.isPaused) {
          this.currentIndex = i;
          return;
        }
        
        if (this.isStopped) {
          return;
        }
        
        try {
          // Simulate API request
          const group = await this.simulateRequest(mockGroupData, i);
          
          // Store data
          await this.storeData(group.id, group.name, group);
          
          // Update progress
          processed++;
          this.updateProgress(processed, mockGroupData.length);
        } catch (error) {
          console.error('Error processing group:', error);
          // Continue with next group
        }
        
        // Respect rate limit
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
      
      this.updateStatus('complete', `Successfully extracted ${processed} groups.`);
      toast({
        title: "Extraction Complete",
        description: `Successfully extracted ${processed} groups.`,
      });
    } catch (error) {
      console.error('Error continuing groups extraction:', error);
      this.updateStatus('error', 'Failed to extract group data.');
    }
  }
}

// Factory function to create extractors
export function createExtractor(type: 'friends' | 'messages' | 'posts' | 'groups'): DataExtractor {
  switch (type) {
    case 'friends':
      return new FriendsExtractor();
    case 'messages':
      return new MessagesExtractor();
    case 'posts':
      return new PostsExtractor();
    case 'groups':
      return new GroupsExtractor();
    default:
      throw new Error('Invalid extractor type');
  }
}
