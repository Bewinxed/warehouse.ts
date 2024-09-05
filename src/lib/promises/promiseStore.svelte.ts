import { SvelteMap } from 'svelte/reactivity';

/** Represents the status of a promise. */
type Status = 'idle' | 'pending' | 'success' | 'error';

/**
 * A class that wraps a promise and provides reactive state management.
 * @template T - The type of the wrapped promise function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PromiseStore<T extends (...args: any[]) => Promise<any>> {
	private _promise = $state<(...args: Parameters<T>) => Promise<ReturnType<T>>>()!;
	/** The current status of the promise. */
	status = $state<Status>('idle');
	/** The result of the promise if successful. */
	result = $state<ReturnType<Awaited<T>>>();
	/** The error if the promise fails. */
	error = $state<Error>();
	/** Options for customizing the behavior of the PromiseStore. */
	opts: {
		onIdle?: () => void;
		onPending?: () => void;
		onSuccess?: (result: ReturnType<Awaited<T>>) => void;
		onError?: (error: Error) => void;
		onFinally?: () => void;
		defaultStatus?: Status;
	} = {};

	/** The derived promise that manages state and executes callbacks. */
	public promise = $derived((...args: Parameters<T>) => {
		if (this.opts.onPending) {
			this.opts.onPending();
		}
		this.status = 'pending';
		return this._promise(...args)
			.then((result) => {
				if (this.opts.onSuccess) {
					this.opts.onSuccess(result);
				}
				this.status = 'success';
				this.result = result;
				this.error = undefined;
			})
			.catch((error) => {
				if (this.opts.onError) {
					this.opts.onError(error);
				}
				this.status = 'error';
				this.error = error;
				this.result = undefined;
			})
			.finally(() => {
				if (this.opts.onFinally) {
					this.opts.onFinally();
				}
				// this.status = 'idle';
			});
	});

	/**
	 * Creates a new PromiseStore instance.
	 * @param promise - The promise function to wrap.
	 * @param opts - Options for customizing the behavior of the PromiseStore.
	 */
	constructor(
		promise: T,
		opts: {
			onIdle?: () => void;
			onPending?: () => void;
			onSuccess?: (result: ReturnType<Awaited<T>>) => void;
			onError?: (error: Error) => void;
			onFinally?: () => void;
			defaultStatus?: Status;
		} = {}
	) {
		this._promise = promise;
		this.opts = opts;
	}
}

/**
 * A class that manages multiple PromiseStore instances using a map.
 * @template T - The type of the wrapped promise function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PromiseMap<T extends (...args: any[]) => Promise<any>> {
	private _promises = new SvelteMap<string, PromiseStore<T>>();

	/**
	 * Retrieves a PromiseStore instance by key.
	 * @param key - The key of the PromiseStore to retrieve.
	 * @returns The PromiseStore instance or undefined if not found.
	 */
	public get(key: string) {
		return this._promises.get(key);
	}

	/**
	 * Sets a new PromiseStore instance with the given key.
	 * @param key - The key to associate with the new PromiseStore.
	 * @param args - The arguments to pass to the PromiseStore constructor.
	 */
	public set(key: string, ...args: ConstructorParameters<typeof PromiseStore>) {
		// eslint-disable-next-line prefer-const
		let newState = $state(new PromiseStore(...args));
		this._promises.set(key, newState);
	}
}

/**
 * Creates a new PromiseStore instance.
 * @param args - The arguments to pass to the PromiseStore constructor.
 * @returns A new PromiseStore instance.
 */
export function createPromiseStore(...args: ConstructorParameters<typeof PromiseStore>) {
	const newState = $state(new PromiseStore(...args));
	return newState;
}
