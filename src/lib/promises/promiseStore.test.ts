import { expect, test, mock } from 'bun:test';
import { PromiseStore, PromiseMap, createPromiseStore } from './promiseStore.svelte.js';

test('PromiseStore', async () => {
	const mockPromise = mock((arg: string) => Promise.resolve(`Hello, ${arg}!`));
	const store = new PromiseStore(mockPromise, {});

	expect(store.status).toBe('idle');

	const promise = store.promise('World');
	expect(store.status).toBe('pending');

	await promise;
	expect(store.status).toBe('success');
	expect(store.result).toBeDefined();
	expect(store.result).resolves.toBe('Hello, World!');
	expect(store.error).toBeUndefined();
	mockPromise.mockImplementation(() => Promise.reject(new Error('Test error')));
	expect(store.promise('Error')).rejects.toThrow('Test error');
	expect(store.status).toBe('error');
	expect(store.error).toBeInstanceOf(Error);
	expect(store.result).toBeUndefined();
});

test('PromiseStore with callbacks', async () => {
	const callbacks = {
		onPending: mock(() => {}),
		onSuccess: mock((result: Promise<string>) => {}),
		onError: mock((error: Error) => {}),
		onFinally: mock(() => {})
	};

	const store = new PromiseStore((arg: string) => Promise.resolve(`Hello, ${arg}!`), callbacks);

	await store.promise('World');
	expect(callbacks.onPending).toHaveBeenCalled();
	expect(callbacks.onSuccess).toHaveBeenCalledWith(expect.any(Promise));
	expect(callbacks.onFinally).toHaveBeenCalled();

	await expect(store.promise('Error')).rejects.toThrow();
	expect(callbacks.onError).toHaveBeenCalled();
	expect(callbacks.onFinally).toHaveBeenCalled();
});

test('PromiseMap', () => {
	const map = new PromiseMap<(arg: string) => Promise<string>>();

	map.set('key1', (arg: string) => Promise.resolve(`Hello, ${arg}!`), {});
	map.set('key2', (arg: string) => Promise.resolve(`Goodbye, ${arg}!`), {});

	const store1 = map.get('key1');
	const store2 = map.get('key2');

	expect(store1).toBeInstanceOf(PromiseStore);
	expect(store2).toBeInstanceOf(PromiseStore);
});

test('createPromiseStore', () => {
	const store = createPromiseStore((arg: string) => Promise.resolve(`Hello, ${arg}!`), {});
	expect(store).toBeInstanceOf(PromiseStore);
});
