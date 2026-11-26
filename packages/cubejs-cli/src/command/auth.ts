import type { CommanderStatic } from 'commander';
import { Config } from '@cubejs-backend/cloud';

import { displayError, event } from '../utils';

const authenticate = async (currentToken: string) => {
  const config = new Config();
  await config.addAuthToken(currentToken);

  await event({
    event: 'Cube Cloud CLI Authenticate'
  });

  console.log('Token successfully added!');
};

export function configureAuthCommand(program: CommanderStatic): void {
  program
    .command('auth <token>')
    .description('Authenticate access to Cube Cloud')
    .action(
      (currentToken) => authenticate(currentToken)
        .catch(e => displayError(e.stack || e))
    )
    .on('--help', () => {
      console.log('');
      console.log('Examples:');
      console.log('');
      console.log('  $ cubejs auth <token>');
      console.log('  $ cubejs deploy');
    });
}
