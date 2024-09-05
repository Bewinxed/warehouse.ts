# warehouse.ts

warehouse.ts is a collection of reactive state management utilities for SvelteKit and Svelte apps.

## Features

- Reactive promise state management
- Support for multiple promise instances
- Customizable callbacks for different promise states
- TypeScript support for type safety

## Installation

To install warehouse.ts, run the following command in your project directory:

```bash
npm install warehouse.ts
```
```bash
pnpm install warehouse.ts
```
```bash
bun install warehouse.ts
```

## Usage

### PromiseStore

The `PromiseStore` class wraps a promise and provides reactive state management:

```typescript
import { createPromiseStore } from 'warehouse.ts';

const myAsyncFunction = async () => {
  // Your async logic here
};

const myPromiseStore = createPromiseStore(myAsyncFunction, {
  onPending: () => console.log('Loading...'),
  onSuccess: (result) => console.log('Success:', result),
  onError: (error) => console.error('Error:', error),
});

// Use the promise
myPromiseStore.promise();

// Access reactive states
console.log(myPromiseStore.status);
console.log(myPromiseStore.result);
console.log(myPromiseStore.error);
```

### PromiseMap

The `PromiseMap` class manages multiple `PromiseStore` instances:

```typescript
import { PromiseMap } from 'warehouse.ts';

const promiseMap = new PromiseMap();

promiseMap.set('user', fetchUser, { /* options */ });
promiseMap.set('posts', fetchPosts, { /* options */ });

// Access individual PromiseStore instances
const userPromise = promiseMap.get('user');
const postsPromise = promiseMap.get('posts');
```

## API Reference

For detailed API documentation, please refer to the source code and inline comments in the `promiseStore.ts` file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)