import { cloneDeep } from 'lodash';

import Team from '../../../services/team-dispatcher/team';

export default class YandexStaffTeam extends Team {

  /**
   * @constructor
   *
   * @param {Object} staff - yandex staff module
   * @param {String} groupId - staff group id
   * @param {Object} options
   */
  constructor(staff, groupId, options) {
    super(options);

    this.staff = staff;

    this.groupId = groupId;
  }

  /**
   * @override
   */
  getMembersForReview() {
    return this.staff
      .getUsersInOffice(this.groupId)
      .then(team => cloneDeep(team));
  }

  /**
   * @override
   */
  findTeamMember(pullRequest, login) {
    return this.staff
      .apiUserInfo(login)
      .then(user => this.staff._addAvatarAndUrl(user));
  }

}
