import { distinctUntilChanged } from 'rxjs/operators';

import { Class, MysqlResult, TableRow } from '../../types';
import { EditorService } from './editor.service';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';

export abstract class MultiRowEditorService<T extends TableRow> extends EditorService<T> {
  private _originalRows: T[] = [];
  private _newRows: T[] = [];
  private _selectedRowId: string|number;

  get newRows(): T[] { return this._newRows; }
  get selectedRowId(): string|number { return this._selectedRowId; }

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    private _entitySecondIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(_entityClass, _entityTable, _entityIdField, handlerService, queryService);
    this.initForm();
  }

  protected getRowIndex(id: string|number): number {
    for (let i = 0; i < this._newRows.length; i++) {
      if (id === this._newRows[i][this._entitySecondIdField]) {
        return i;
      }
    }

    console.error(`getRowIndex() failed in finding row having ${this._entitySecondIdField} ${id}`);
  }

  protected getSelectedRowIndex(): number {
    return this.getRowIndex(this._selectedRowId);
  }

  protected initForm() {
    super.initForm();

    this._form.valueChanges.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(() => {
      if (!this._loading) {
        if (this._form.dirty) {
          this._newRows[this.getSelectedRowIndex()] = this._form.getRawValue();
          this.updateDiffQuery();
          this._newRows = [ ...this._newRows ];
        }
        this.updateFullQuery();
      }
    });
  }

  protected onReloadSuccessful(data: MysqlResult<T>, id: string|number) {
    for (const row of data.results) {
      this._originalRows.push({ ...row });
      this._newRows.push({ ...row });
    }
    this._selectedRowId = null;
    this._form.disable();
    this._loadedEntityId = id;
    this.updateFullQuery();
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
      this._entityTable,
      this._entityIdField,
      this._entitySecondIdField,
      this._originalRows,
      this._newRows,
    );
  }

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(
      this._entityTable,
      this._newRows,
      this._entityIdField,
    );
  }

  onRowSelection({ selected }: { selected: T[]} ): void {
    const newId = selected[0][this._entitySecondIdField];

    if (newId === this._selectedRowId) {
      return;
    }

    this._loading = true;
    this._selectedRowId = newId;
    this._form.enable();
    this._form.reset();

    const index = this.getSelectedRowIndex();

    for (const field of this.fields) {
      this._form.get(field).setValue(
        this._newRows[index][field]
      );
    }

    this._loading = false;
  }

  isRowSelected(row: T): boolean {
    return row[this._entitySecondIdField] === this._selectedRowId;
  }

  deleteSelectedRow(): void {
    if (this._selectedRowId === null) {
      return;
    }

    this._newRows.splice(this.getSelectedRowIndex(), 1);
    this._newRows = [ ...this._newRows ];
    this.updateDiffQuery();
    this.updateFullQuery();
  }

  addNewRow(): void {
    // TODO
  }
}
