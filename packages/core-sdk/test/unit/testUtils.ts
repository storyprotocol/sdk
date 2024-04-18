import sinon from "sinon";

export function createMock<T>(obj = {}): T {
  const mockObj: any = obj;
  mockObj.waitForTransactionReceipt = sinon.stub().resolves({});
  return mockObj;
}

export function createFileReaderMock(
  base64: string,
  onLoadEvent?: ProgressEvent<FileReader>,
  onErrorEvent?: ProgressEvent<FileReader>,
) {
  return class FileReaderMock {
    // Adding required static properties
    readonly EMPTY = 0;
    readonly LOADING = 1;
    readonly DONE = 2;

    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    // Properties
    readyState: 0 | 1 | 2 = 0;
    result: string | ArrayBuffer | null = null;
    error: DOMException | null = null;

    // Simulate the readAsDataURL method
    readAsDataURL(blob: Blob) {
      setTimeout(() => {
        // Implementation of your mock logic
        // For example, setting the result and triggering onload
        this.result = base64; // Simulated result
        if (onLoadEvent) {
          this.onload?.(onLoadEvent);
        }
        if (onErrorEvent) {
          this.onerror?.(onErrorEvent);
        }
      }, 100); // Simulate async behavior
    }

    abort(): void {
      /* Mock implementation */
    }
    readAsArrayBuffer(blob: Blob): void {
      /* Mock implementation */
    }
    readAsBinaryString(blob: Blob): void {
      /* Mock implementation */
    }
    readAsText(blob: Blob, encoding?: string): void {
      /* Mock implementation */
    }

    // Adding event listener methods
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void {
      /* Mock implementation */
    }
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void {
      /* Mock implementation */
    }
    dispatchEvent(event: Event): boolean {
      /* Mock implementation */ return false;
    }
  };
}
