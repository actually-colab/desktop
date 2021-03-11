import { Notebook, NotebookAccessLevel } from '@actually-colab/editor-client';
import { List as ImmutableList } from 'immutable';

import {
  EditorCell,
  ImmutableEditorCell,
  ImmutableKernelOutput,
  ImmutableLock,
  ImmutableNotebook,
  ImmutableNotebookAccessLevel,
  ImmutableReducedNotebook,
  KernelOutput,
  Lock,
  PseudoImmutableNotebook,
  PseudoImmutableReducedNotebook,
  ReducedNotebook,
} from '../../types/notebook';
import { makeImmutableObject } from './helper';

export const makeImmutableKernelOutput = (kernelOutput: KernelOutput): ImmutableKernelOutput =>
  makeImmutableObject<KernelOutput, ImmutableKernelOutput>(kernelOutput);

export const makeImmutableEditorCell = (editorCell: EditorCell): ImmutableEditorCell =>
  makeImmutableObject<EditorCell, ImmutableEditorCell>(editorCell);

export const makeImmutableLock = (lock: Lock): ImmutableLock => makeImmutableObject<Lock, ImmutableLock>(lock);

export const makeImmutableNotebookAccessLevel = (
  accessLevel: Required<NotebookAccessLevel>
): ImmutableNotebookAccessLevel => makeImmutableObject<NotebookAccessLevel, ImmutableNotebookAccessLevel>(accessLevel);

export const makeImmutableNotebook = (notebook: Notebook): ImmutableNotebook =>
  makeImmutableObject<PseudoImmutableNotebook, ImmutableNotebook>({
    ...notebook,
    users: ImmutableList(notebook.users.map((user) => makeImmutableNotebookAccessLevel(user))),
  });

export const makeImmutableReducedNotebook = (notebook: ReducedNotebook): ImmutableReducedNotebook =>
  makeImmutableObject<PseudoImmutableReducedNotebook, ImmutableReducedNotebook>({
    ...notebook,
    users: ImmutableList(notebook.users.map((user) => makeImmutableNotebookAccessLevel(user))),
    cell_ids: ImmutableList(notebook.cell_ids),
  });
