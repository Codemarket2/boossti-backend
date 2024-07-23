import MyStack from './MyStack';
import * as sst from '@serverless-stack/resources';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs20.x',
  });

  new MyStack(app, 'stack');
}
