import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SpellSearchService } from '../../search/spell-search.service';
import { SPELL_ID } from '@keira-types/spell.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-spell-selector-modal',
  templateUrl: './spell-selector-modal.component.html',
  styleUrls: ['./spell-selector-modal.component.scss'],
})
export class SpellSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: SpellSearchService) {
    super(SPELL_ID, bsModalRef);
  }
}
