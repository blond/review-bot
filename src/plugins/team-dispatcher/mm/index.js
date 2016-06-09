import { map, flatten } from 'lodash';
import MMTeam from './class';

export default function setup(options, imports) {

  const staff = imports.staff;

  const teams = {
    image: imports['team-mm-image-staff'],
    video: imports['team-mm-video-staff']
  };

  const groups = flatten(map(teams, (team) => team.groupId));

  const service = new MMTeam(staff, groups, teams);

  return service;

}