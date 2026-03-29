import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService implements OnModuleInit {
  onModuleInit() {
    const partialsDir = join(__dirname, 'templates/components');
    const filenames = fs.readdirSync(partialsDir);

    filenames.forEach((filename) => {
      const name = filename.replace(/\.(html|hbs)$/, '');
      const template = fs.readFileSync(join(partialsDir, filename), 'utf8');
      Handlebars.registerPartial(name, template);
    });
  }
}
