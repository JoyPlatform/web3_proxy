import EventEmmitter from 'eventemitter3';
export {EventEmmitter as EventEmmitter};

const EventBus = new EventEmmitter();
export default EventBus;