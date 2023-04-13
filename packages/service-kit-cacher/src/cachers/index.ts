/* eslint-disable @typescript-eslint/no-explicit-any */

import redis from './redis';
import memory from './memory';
import { ICacher } from '@service-kit/common';

interface ICachers {
  [key: string]: (...args: any[]) => ICacher;
}
const cachers: ICachers = {
  redis,
  memory
};

export default cachers;
