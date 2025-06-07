# Dictionary Adapter System

This directory contains the new modular dictionary adapter system that allows WordCarve to support multiple dictionary sources through a unified interface.

## Architecture

### Base Adapter (`base.ts`)

The `BaseDictionaryAdapter` class provides common functionality for all dictionary adapters:

- Caching mechanism with configurable timeout
- Query validation
- Abstract interface that all adapters must implement

### Available Adapters

#### 1. Online Dictionary Adapter (`online.ts`)

- **Name**: `online`
- **Display Name**: 在线词典
- **Description**: Uses the existing WordCarve online API
- **Features**:
  - Full dictionary definitions with pronunciations
  - Collocations and synonyms
  - Frequency data
  - Caching support

#### 2. Local Dictionary Adapter (`local.ts`)

- **Name**: `local`
- **Display Name**: 本地词典
- **Description**: Uses the local IndexedDB dictionary
- **Features**:
  - Offline access
  - Fast lookup
  - Converts local format to online format
  - Works with imported dictionary files

### Rendering Components

Each adapter type has its own dedicated Vue rendering component:

#### 1. Online Dictionary Renderer (`src/components/search/renderers/OnlineDictionaryRenderer.vue`)

- **Purpose**: Renders results from online dictionary adapter
- **Features**:
  - Uses existing `OnlineDictEntry` components
  - Modern UnoCSS styling with gradients and animations
  - Loading states with skeleton components
  - Error handling with retry functionality
  - Result summary with cache indicators

#### 2. Local Dictionary Renderer (`src/components/search/renderers/LocalDictionaryRenderer.vue`)

- **Purpose**: Renders results from local dictionary adapter
- **Features**:
  - Uses existing `WordDisplay` components
  - Consistent styling with online renderer
  - Optimized for local dictionary data structure
  - Fast rendering for offline results

### Adapter Manager (`manager.ts`)

The `DictionaryAdapterManager` class coordinates all adapters:

```typescript
// Get all available adapters
const adapters = dictionaryManager.getAvailableAdapters()

// Search with specific adapter
const result = await dictionaryManager.search('hello', 'online')

// Search with multiple adapters
const results = await dictionaryManager.searchMultiple('hello', ['online', 'local'])

// Check adapter availability
const availability = await dictionaryManager.checkAvailability()
```

## Adding New Adapters

To add a new dictionary adapter:

1. **Create the adapter class**:

```typescript
import { BaseDictionaryAdapter } from './base'
import type { DictionarySearchResult } from '@/types/dictionary'

export class MyDictionaryAdapter extends BaseDictionaryAdapter {
  name = 'my-dict'
  displayName = '我的词典'
  icon = 'i-carbon-book'

  async search(query: string): Promise<DictionarySearchResult> {
    // Implement search logic
  }

  async isAvailable(): Promise<boolean> {
    // Check if the dictionary service is available
  }
}
```

2. **Create a dedicated renderer component**:

```vue
<!-- src/components/search/renderers/MyDictionaryRenderer.vue -->
<script setup lang="ts">
import type { DictionarySearchResult } from '@/types/dictionary'
// Import your specific dictionary entry type and components
</script>

<template>
  <div class="my-dictionary-renderer">
    <!-- Implement your custom rendering logic -->
  </div>
</template>
```

3. **Register the adapter**:

```typescript
// In manager.ts constructor
this.registerAdapter(new MyDictionaryAdapter())
```

4. **Update SearchResults.vue**:

```vue
<!-- Add your renderer to the main SearchResults component -->
<MyDictionaryRenderer
  v-else-if="currentAdapter?.resultType === 'my-type'"
  :result="currentResult"
  :error="currentError"
  :loading="isLoading"
  :query="searchStore.currentQuery"
  @retry="handleRetry"
/>
```

3. **Export from index**:

```typescript
// In index.ts
export { MyDictionaryAdapter } from './my-dict'
```

## Search Store Integration

The search store (`src/stores/searchStore.ts`) manages:

- Current search query
- Results from all adapters
- Search history
- Error states
- Loading states

## UI Components

### SearchTabs (`src/components/search/SearchTabs.vue`)

- Displays tabs for each available adapter
- Shows availability status
- Displays result counts
- Handles tab switching

### SearchResults (`src/components/search/SearchResults.vue`)

- Shows results from the active adapter
- Handles loading and error states
- Displays empty states

### SearchInput (`src/components/search/SearchInput.vue`)

- Modern search input with autocomplete
- Search suggestions from history
- Debounced input handling

## Features

### Caching

- Each adapter has its own cache
- 5-minute cache timeout by default
- Automatic cache cleanup
- Cache hit indicators in UI

### Error Handling

- Per-adapter error tracking
- Graceful fallbacks
- Retry mechanisms
- User-friendly error messages

### Availability Checking

- Real-time adapter status
- Network connectivity checks
- Service health monitoring
- Visual status indicators

### Search History

- Persistent search history
- Recent search suggestions
- Search statistics
- History management

## Performance Optimizations

- **Debounced search**: Prevents excessive API calls
- **Parallel searching**: Multiple adapters search simultaneously
- **Smart caching**: Reduces redundant requests
- **Lazy loading**: Components load only when needed
- **Virtual scrolling**: For large result sets (future enhancement)

## Extensibility

The system is designed to be easily extensible:

- Add new dictionary sources
- Customize search behavior
- Implement specialized adapters
- Add new UI components
- Extend caching strategies

## Testing

Each adapter should include:

- Unit tests for search functionality
- Availability checking tests
- Error handling tests
- Cache behavior tests
- Mock data for development
