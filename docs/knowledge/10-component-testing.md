# コンポーネントテストガイド

## 基本的なテストパターン

### Server Component のテスト

Server Component は非同期関数として実装されているため、テスト時は特別な処理が必要。

```typescript
// src/app/(site)/home/home.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';

// Server Actions のモック
vi.mock('lib/actions/getEvents', () => ({
  getEvents: vi.fn(),
}));

vi.mock('lib/actions/getHomeSummary', () => ({
  getHomeSummary: vi.fn(),
}));

// NextAuth のモック
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render home page with events when authenticated', async () => {
    const mockEvents = [
      {
        id: '1',
        name: 'Test Event',
        date: '2024-01-01',
        participants: 5,
        photos: 10,
        models: 2,
        status: 'active' as const,
        thumbnail: '/test.jpg',
      },
    ];

    const mockSummary = {
      totalEvents: 1,
      totalPhotos: 10,
      totalModels: 2,
      eventsThisMonth: 1,
      photosThisMonth: 5,
      modelsThisMonth: 1,
    };

    // モックの設定
    const { getServerSession } = await import('next-auth');
    const { getEvents } = await import('lib/actions/getEvents');
    const { getHomeSummary } = await import('lib/actions/getHomeSummary');

    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' },
    } as any);

    vi.mocked(getEvents).mockResolvedValue(mockEvents);
    vi.mocked(getHomeSummary).mockResolvedValue(mockSummary);

    // Server Component を実行してJSXを取得
    const HomeComponent = await Home();
    render(HomeComponent);

    // 表示内容の検証
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should handle fetch errors gracefully', async () => {
    // エラーをモック
    const { getServerSession } = await import('next-auth');
    const { getEvents } = await import('lib/actions/getEvents');

    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1', name: 'Test User' },
    } as any);

    vi.mocked(getEvents).mockRejectedValue(new Error('Fetch failed'));

    // エラー時でもページが表示されることを確認
    const HomeComponent = await Home();
    render(HomeComponent);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should show sign in prompt when not authenticated', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);

    const HomeComponent = await Home();
    render(HomeComponent);

    expect(screen.getByText('ログインしてください')).toBeInTheDocument();
  });
});
```

### Client Component のテスト

Client Component は通常の React コンポーネントと同様にテストできる。

```typescript
// src/components/content/ImageViewer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageViewer } from './ImageViewer';

describe('ImageViewer', () => {
  const mockContent = {
    id: '1',
    title: 'Test Image',
    fileUrl: '/test-image.jpg',
    thumbnailUrl: '/test-thumb.jpg',
    mimeType: 'image/jpeg',
  };

  it('should render image with correct src and alt', () => {
    render(<ImageViewer content={mockContent} />);

    const image = screen.getByAltText('Test Image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should show loading state initially', () => {
    render(<ImageViewer content={mockContent} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should handle image load event', async () => {
    render(<ImageViewer content={mockContent} />);

    const image = screen.getByAltText('Test Image');
    fireEvent.load(image);

    await waitFor(() => {
      expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    });
  });

  it('should handle image error', async () => {
    render(<ImageViewer content={mockContent} />);

    const image = screen.getByAltText('Test Image');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByText('画像の読み込みに失敗しました')).toBeInTheDocument();
    });
  });
});
```

## ユーザーインタラクションのテスト

### フォーム操作のテスト

```typescript
// src/components/forms/EventForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EventForm } from './EventForm';

// Server Action のモック
const mockCreateEvent = vi.fn();
vi.mock('lib/actions/createEvent', () => ({
  createEvent: mockCreateEvent,
}));

describe('EventForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should submit form with correct data', async () => {
    mockCreateEvent.mockResolvedValue({ id: '1', name: 'New Event' });

    render(<EventForm />);

    // フォームフィールドに入力
    await user.type(screen.getByLabelText('イベント名'), 'Test Event');
    await user.type(screen.getByLabelText('説明'), 'Test Description');

    // 日付を選択
    const dateInput = screen.getByLabelText('開催日');
    await user.type(dateInput, '2024-12-25');

    // フォームを送信
    await user.click(screen.getByRole('button', { name: '作成' }));

    // Server Action が正しい引数で呼ばれることを確認
    await waitFor(() => {
      expect(mockCreateEvent).toHaveBeenCalledWith({
        name: 'Test Event',
        description: 'Test Description',
        date: '2024-12-25',
      });
    });

    // 成功メッセージの表示を確認
    expect(screen.getByText('イベントが作成されました')).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<EventForm />);

    // 空のまま送信
    await user.click(screen.getByRole('button', { name: '作成' }));

    // バリデーションエラーの表示を確認
    expect(screen.getByText('イベント名は必須です')).toBeInTheDocument();
    expect(screen.getByText('開催日は必須です')).toBeInTheDocument();
  });

  it('should handle server errors gracefully', async () => {
    mockCreateEvent.mockRejectedValue(new Error('サーバーエラー'));

    render(<EventForm />);

    // 正しい情報を入力
    await user.type(screen.getByLabelText('イベント名'), 'Test Event');
    await user.type(screen.getByLabelText('開催日'), '2024-12-25');

    // フォームを送信
    await user.click(screen.getByRole('button', { name: '作成' }));

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('イベントの作成に失敗しました')).toBeInTheDocument();
    });
  });
});
```

### ダイアログ操作のテスト

```typescript
// src/components/dialogs/DeleteConfirmDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const user = userEvent.setup();
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show confirmation dialog when opened', () => {
    render(
      <DeleteConfirmDialog
        isOpen={true}
        title="イベントを削除"
        message="本当にこのイベントを削除しますか？"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('イベントを削除')).toBeInTheDocument();
    expect(screen.getByText('本当にこのイベントを削除しますか？')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    render(
      <DeleteConfirmDialog
        isOpen={true}
        title="イベントを削除"
        message="本当にこのイベントを削除しますか？"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: '削除' }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    render(
      <DeleteConfirmDialog
        isOpen={true}
        title="イベントを削除"
        message="本当にこのイベントを削除しますか？"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should close dialog when ESC key is pressed', async () => {
    render(
      <DeleteConfirmDialog
        isOpen={true}
        title="イベントを削除"
        message="本当にこのイベントを削除しますか？"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
```

## 状態管理のテスト

### useState のテスト

```typescript
// src/components/ui/SearchInput.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  const user = userEvent.setup();
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update input value when typing', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('検索...');
    await user.type(input, 'テスト検索');

    expect(input).toHaveValue('テスト検索');
  });

  it('should call onSearch when Enter is pressed', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('検索...');
    await user.type(input, 'テスト検索');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('テスト検索');
  });

  it('should clear input when clear button is clicked', async () => {
    render(<SearchInput onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('検索...');
    await user.type(input, 'テスト検索');

    const clearButton = screen.getByRole('button', { name: 'クリア' });
    await user.click(clearButton);

    expect(input).toHaveValue('');
  });
});
```

### useEffect のテスト

```typescript
// src/components/content/AutoSaveEditor.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutoSaveEditor } from './AutoSaveEditor';

// タイマーをモック
vi.useFakeTimers();

describe('AutoSaveEditor', () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should auto-save after 2 seconds of inactivity', async () => {
    render(<AutoSaveEditor onSave={mockOnSave} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'テストテキスト');

    // 2秒経過をシミュレート
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockOnSave).toHaveBeenCalledWith('テストテキスト');
  });

  it('should not auto-save if user continues typing', async () => {
    render(<AutoSaveEditor onSave={mockOnSave} />);

    const textarea = screen.getByRole('textbox');

    // 継続的に入力
    await user.type(textarea, 'テスト');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await user.type(textarea, 'テキスト');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // まだ保存されていないことを確認
    expect(mockOnSave).not.toHaveBeenCalled();

    // さらに2秒待つ
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockOnSave).toHaveBeenCalledWith('テストテキスト');
  });
});
```

## アクセシビリティのテスト

### フォーカス管理のテスト

```typescript
// src/components/ui/Modal.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  const user = userEvent.setup();

  it('should focus first focusable element when opened', async () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <input placeholder="First input" />
        <button>Click me</button>
      </Modal>
    );

    const firstInput = screen.getByPlaceholderText('First input');
    expect(firstInput).toHaveFocus();
  });

  it('should trap focus within modal', async () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <input placeholder="First input" />
        <button>Second button</button>
        <input placeholder="Last input" />
      </Modal>
    );

    const firstInput = screen.getByPlaceholderText('First input');
    const lastInput = screen.getByPlaceholderText('Last input');

    // 最後の要素でTabを押すと最初の要素にフォーカス
    lastInput.focus();
    await user.keyboard('{Tab}');
    expect(firstInput).toHaveFocus();

    // 最初の要素でShift+Tabを押すと最後の要素にフォーカス
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(lastInput).toHaveFocus();
  });
});
```

### ARIA 属性のテスト

```typescript
// src/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should have correct ARIA attributes when loading', () => {
    render(<Button isLoading={true}>保存</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('should have correct ARIA label when provided', () => {
    render(<Button aria-label="メニューを開く">☰</Button>);

    const button = screen.getByRole('button', { name: 'メニューを開く' });
    expect(button).toBeInTheDocument();
  });
});
```

## 非同期処理のテスト

### データ読み込みのテスト

```typescript
// src/components/content/ContentList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContentList } from './ContentList';

// API をモック
const mockFetchContents = vi.fn();
vi.mock('lib/api/contents', () => ({
  fetchContents: mockFetchContents,
}));

describe('ContentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockFetchContents.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<ContentList eventId="event-1" />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should show contents when loaded successfully', async () => {
    const mockContents = [
      { id: '1', title: 'Content 1', type: 'PHOTO' },
      { id: '2', title: 'Content 2', type: 'VIDEO' },
    ];

    mockFetchContents.mockResolvedValue(mockContents);

    render(<ContentList eventId="event-1" />);

    await waitFor(() => {
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
  });

  it('should show error message when loading fails', async () => {
    mockFetchContents.mockRejectedValue(new Error('API Error'));

    render(<ContentList eventId="event-1" />);

    await waitFor(() => {
      expect(screen.getByText('データの読み込みに失敗しました')).toBeInTheDocument();
    });
  });
});
```

## カスタムフックのテスト

```typescript
// src/hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // localStorage をクリア
    window.localStorage.clear();
  });

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('should return stored value when it exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(window.localStorage.getItem('test-key')).toBe(
      JSON.stringify('new-value')
    );
  });
});
```
