export function compileHtml(element: HTMLElement, scope: any): void {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null, false);

	let node: Node | null;
	while (node = walker.nextNode()) {
		switch (node.nodeType) {
			case Node.ELEMENT_NODE:
				compileElement(node as HTMLElement, scope);
				break;
		}
	}
}

type ObserverFunction = (value: any) => void;

function compileElement(element: HTMLElement, scope: any): void {
	if (element.hasAttribute('data-bind')) {
		const bindExpr = element.getAttribute('data-bind')!;
		const [object, key] = resolvePropertyExpression(bindExpr, scope);
		registerWatcher(object, key, value => {
			element.textContent = String(value);
		});
	}
}

function registerWatcher(object: object, key: string, observer: ObserverFunction): void {
	getPropertyObserverList(object, key).push(observer);
	observer(object[key]);
}

function getPropertyObserverList(object: object, key: string): ObserverFunction[] {
	const watcherKey = '$__' + key;
	let observerList: ObserverFunction[];
	if (object.hasOwnProperty(watcherKey)) {
		console.log('ready');
		observerList = object[watcherKey]
	} else {
		console.log('make');
		object[watcherKey] = observerList = [];
		let actualValue = object[key];
		Object.defineProperty(object, key, {
			get() {
				return actualValue;
			},
			set(newValue) {
				if (actualValue === newValue) {
					return;
				}
				actualValue = newValue;
				// todo: prevent recursion
				for (const observer of observerList) {
					observer(actualValue);
				}
			},
		});
	}
	return observerList;
}

function resolvePropertyExpression(expr: string, scope: any): [object, string] {
	const parts = expr.split('.');
	const count = parts.length - 1;
	if (count < 1) {
		// todo:
		throw new Error('!!!');
	}
	let result = scope;
	for (let i = 0; i < count; i++) {
		const key = parts[i];
		result = result[key];
	}
	if (typeof result !== 'object') {
		// todo:
		throw new TypeError('!!!');
	}
	return [result, parts[count]];
}

// function evalExpr(expr: string, scope: any): any {
// 	return Function('scope', `with(scope){return ${expr};}`)(scope);
// }
