/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { toResource, SideBySideEditor } from 'vs/workbench/common/editor';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { workbenchInstantiationService, TestServiceAccessor, TestEditorInput } from 'vs/workbench/test/browser/workbenchTestServices';
import { Schemas } from 'vs/base/common/network';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';

suite('Workbench editor', () => {

	let instantiationService: IInstantiationService;
	let accessor: TestServiceAccessor;

	setup(() => {
		instantiationService = workbenchInstantiationService();
		accessor = instantiationService.createInstance(TestServiceAccessor);
	});

	teardown(() => {
		accessor.untitledTextEditorService.dispose();
	});

	test('toResource', () => {
		const service = accessor.untitledTextEditorService;

		assert.ok(!toResource(null!));

		const untitled = instantiationService.createInstance(UntitledTextEditorInput, service.create());

		assert.equal(toResource(untitled)!.toString(), untitled.resource.toString());
		assert.equal(toResource(untitled, { supportSideBySide: SideBySideEditor.MASTER })!.toString(), untitled.resource.toString());
		assert.equal(toResource(untitled, { supportSideBySide: SideBySideEditor.DETAILS })!.toString(), untitled.resource.toString());
		assert.equal(toResource(untitled, { supportSideBySide: SideBySideEditor.BOTH })!.toString(), untitled.resource.toString());
		assert.equal(toResource(untitled, { filterByScheme: Schemas.untitled })!.toString(), untitled.resource.toString());
		assert.equal(toResource(untitled, { filterByScheme: [Schemas.file, Schemas.untitled] })!.toString(), untitled.resource.toString());
		assert.ok(!toResource(untitled, { filterByScheme: Schemas.file }));

		const file = new TestEditorInput(URI.file('/some/path.txt'), 'editorResourceFileTest');

		assert.equal(toResource(file)!.toString(), file.resource.toString());
		assert.equal(toResource(file, { supportSideBySide: SideBySideEditor.MASTER })!.toString(), file.resource.toString());
		assert.equal(toResource(file, { supportSideBySide: SideBySideEditor.DETAILS })!.toString(), file.resource.toString());
		assert.equal(toResource(file, { supportSideBySide: SideBySideEditor.BOTH })!.toString(), file.resource.toString());
		assert.equal(toResource(file, { filterByScheme: Schemas.file })!.toString(), file.resource.toString());
		assert.equal(toResource(file, { filterByScheme: [Schemas.file, Schemas.untitled] })!.toString(), file.resource.toString());
		assert.ok(!toResource(file, { filterByScheme: Schemas.untitled }));

		const diffEditorInput = new DiffEditorInput('name', 'description', untitled, file);

		assert.ok(!toResource(diffEditorInput));
		assert.ok(!toResource(diffEditorInput, { filterByScheme: Schemas.file }));

		assert.equal(toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.MASTER })!.toString(), file.resource.toString());
		assert.equal(toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.MASTER, filterByScheme: Schemas.file })!.toString(), file.resource.toString());
		assert.equal(toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.MASTER, filterByScheme: [Schemas.file, Schemas.untitled] })!.toString(), file.resource.toString());

		assert.equal(toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.DETAILS })!.toString(), untitled.resource.toString());
		assert.equal(toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.DETAILS, filterByScheme: Schemas.untitled })!.toString(), untitled.resource.toString());
		assert.equal(toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.DETAILS, filterByScheme: [Schemas.file, Schemas.untitled] })!.toString(), untitled.resource.toString());

		assert.equal((toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.BOTH }) as { master: URI, detail: URI }).master.toString(), file.resource.toString());
		assert.equal((toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.BOTH, filterByScheme: Schemas.file }) as { master: URI, detail: URI }).master.toString(), file.resource.toString());
		assert.equal((toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.BOTH, filterByScheme: [Schemas.file, Schemas.untitled] }) as { master: URI, detail: URI }).master.toString(), file.resource.toString());

		assert.equal((toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.BOTH }) as { master: URI, detail: URI }).detail.toString(), untitled.resource.toString());
		assert.equal((toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.BOTH, filterByScheme: Schemas.untitled }) as { master: URI, detail: URI }).detail.toString(), untitled.resource.toString());
		assert.equal((toResource(diffEditorInput, { supportSideBySide: SideBySideEditor.BOTH, filterByScheme: [Schemas.file, Schemas.untitled] }) as { master: URI, detail: URI }).detail.toString(), untitled.resource.toString());
	});
});
