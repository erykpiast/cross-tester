import chai from 'chai';
import chaiSpies from 'chai-spies';

chai.use(chaiSpies);

export const mock = chai.spy(function createTest(config) {

  function enter() {
    return chai.spy(() => Promise.resolve([{}]));
  }


  function getBrowserLogs(levelName) {
    return Promise.resolve([{}]);
  }


  function getResults() {
    return Promise.resolve([{}]);
  }


  function execute(code) {
    return chai.spy(() => Promise.resolve());
  }


  function sleep(time) {
    return chai.spy(() => Promise.resolve());
  }


  function open(url) {
    return chai.spy(() => Promise.resolve());
  }


  function quit() {
    return chai.spy(() => Promise.resolve());
  }


  return {
    enter,
    quit,
    open,
    getBrowserLogs,
    getResults,
    execute,
    sleep
  };
});
