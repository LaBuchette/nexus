import { Test, TestingModule } from '@nestjs/testing';
import { LfgController } from './lfg.controller';

describe('LfgController', () => {
  let controller: LfgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LfgController],
    }).compile();

    controller = module.get<LfgController>(LfgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
