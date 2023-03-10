import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'express-handlebars';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.engine(
    'hbs',
    hbs({
      extname: 'hbs',
      layoutsDir: join(__dirname, '..', 'views/layouts/'),
      partialsDir: join(__dirname, '..', 'views/partials/'),
      helpers: {
        json: function (context) {
          return JSON.stringify(context);
        },
        when: function (operand_1, operator, operand_2, options) {
          var operators = {
              eq: function (l, r) {
                return l == r;
              },
              noteq: function (l, r) {
                return l != r;
              },
              gt: function (l, r) {
                return Number(l) > Number(r);
              },
              gteq: function (l, r) {
                return Number(l) >= Number(r);
              },
              lt: function (l, r) {
                return Number(l) < Number(r);
              },
              lteq: function (l, r) {
                return Number(l) <= Number(r);
              },
              or: function (l, r) {
                return l || r;
              },
              and: function (l, r) {
                return l && r;
              },
              '%': function (l, r) {
                return l % r === 0;
              },
            },
            result = operators[operator](operand_1, operand_2);

          if (result) return options.fn(this);
          else return options.inverse(this);
        },
      },
    }),
  );
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();
