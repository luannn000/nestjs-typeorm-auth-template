import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService implements OnModuleInit {
  onModuleInit() {
    const partialsDir = join(process.cwd(), 'src/commom/templates/components');
    const filenames = fs.readdirSync(partialsDir);

    filenames.forEach((filename) => {
      const name = filename.replace(/\.(html|hbs)$/, '');
      const template = fs.readFileSync(join(partialsDir, filename), 'utf8');
      Handlebars.registerPartial(name, template);
    });
  }
}
