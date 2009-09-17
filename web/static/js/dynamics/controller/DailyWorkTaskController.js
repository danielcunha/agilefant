DailyWorkTaskController = function(model, view, parentController) {
    this.model = model;
    this.view = view;
    this.parentController = parentController;
    
    var me = this;
    this.stateListener = function (event) {
        me.actualStateListener(event);
    };
    
    this.model.addListener(this.stateListener);
};

DailyWorkTaskController.prototype = new TaskController();

DailyWorkTaskController.prototype.actualStateListener = function(event) {
    if (event instanceof DynamicsEvents.EditEvent && event.getObject().getState() === "DONE") {
        this.removeTaskFromDailyWork();
        this.model.removeListener(this.stateListener);
    }
};

DailyWorkTaskController.columnIndices = TaskController.columnIndices;

DailyWorkTaskController.prototype.sortAndMoveDailyTask = function(view, model, newPos) {
  var previousRow = newPos - 1;
  var targetView  = view.getParentView();
  var targetModel = view.getParentView().getModel();
  
  // viewType === workQueue, hopefully
  if (view.getParentView().getDataRowAt(previousRow)) {
    previousTask = view.getParentView().getDataRowAt(previousRow).getModel();
    model.rankDailyUnder(previousTask.getId(), targetModel);
  }
  else {
    model.rankDailyUnder(-1, targetModel);
  }
};

DailyWorkTaskController.prototype.addAndRankDailyTask = function (view, model, newPos) {
    var previousRow = newPos - 1;
    var targetView  = view.getParentView();
    var targetModel = view.getParentView().getModel();
    var viewType    = targetView.dailyWorkViewType;

    if (viewType === "myWork") {
        return;
    }

    // viewType === workQueue, hopefully
    if (view.getParentView().getDataRowAt(previousRow)) {
      previousTask = view.getParentView().getDataRowAt(previousRow).getModel();
      model.rankDailyUnder(previousTask.getId(), targetModel);
    }
    else {
      model.rankDailyUnder(-1, targetModel);
    }
};

DailyWorkTaskController.prototype.moveTask = function(targetModel) {
  this.model.rankUnder(-1, targetModel);
};

DailyWorkTaskController.prototype.removeTaskFromDailyWork = function() {
  this.model.removeFromDailyWork();
};

DailyWorkTaskController.prototype.cssClassResolver = function() {
  if (this.model.getTaskClass() === "NEXT_ASSIGNED") {
      return ["daily-work-next-assigned"];
  }

  return [];
};

DailyWorkTaskController.prototype.actionColumnFactory = function(view, model) {
    var items = [
     {
         text: "Details",
         callback : TaskController.prototype.openDetails
     }, 
     {
         text : "Remove from this list",
         callback : DailyWorkTaskController.prototype.removeTaskFromDailyWork
     },
     {
         text : "Edit",
         callback : TaskController.prototype.editTask
     },
     {
         text : "Delete",
         callback : TaskController.prototype.removeTask
     }, 
     {
         text : "Reset original estimate",
         callback : TaskController.prototype.resetOriginalEstimate
     }
     ];
    var actionView = new DynamicTableRowActions(items, this, this.model,
            view);
    return actionView;
};