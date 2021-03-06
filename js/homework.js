MyHomeworkSpace.Pages.homework = {
	init: function() {
		$("#deleteHomeworkModal").click(function() {
			if (confirm("Are you sure you want to delete this?")) {
				$("#homeworkModal").modal('hide');
				$("#loadingModal").modal({
					backdrop: "static",
					keyboard: false
				});
				MyHomeworkSpace.API.post("homework/delete", {
					id: $("#homeworkModal").attr("data-actionId")
				}, function(xhr) {
					MyHomeworkSpace.Pages.homework.handleNew();
					$("#loadingModal").modal('hide');
				});
			}
		});
		$("#submitHomeworkModal").click(function() {
			if ($("#homeworkClass").val() == -1) {
				alert("You must select a class.");
				return;
			}
			var type = $("#homeworkModal").attr("data-actionType");
			var id = $("#homeworkModal").attr("data-actionId");

			var hwItem = {
				name: $("#homeworkName").val(),
				due: $("#homeworkDue").val(),
				desc: $("#homeworkDesc").val(),
				complete: ($("#homeworkComplete").prop("checked") ? "1" : "0"),
				classId: $("#homeworkClass").val()
			};

			$("#homeworkModal").modal('hide');
			$("#loadingModal").modal({
				backdrop: "static",
				keyboard: false
			});
			if (type == "add") {
				MyHomeworkSpace.API.post("homework/add", hwItem, function(xhr) {
					MyHomeworkSpace.Pages.homework.handleNew();
					$("#loadingModal").modal('hide');
				});
			} else {
				hwItem.id = id;
				MyHomeworkSpace.API.post("homework/edit", hwItem, function(xhr) {
					MyHomeworkSpace.Pages.homework.handleNew();
					$("#loadingModal").modal('hide');
				});
			}
		});
	},
	edit: function(id) {
		$("#loadingModal").modal({
			backdrop: "static",
			keyboard: false
		});
		MyHomeworkSpace.API.get("homework/get/" + id, {}, function(xhr) {
			var hw = xhr.responseJSON.homework;

			$("#homeworkModal").attr("data-actionType", "edit");
			$("#homeworkModal").attr("data-actionId", hw.id);
			$("#homeworkModalType").text("Edit");
			$("#homeworkName").val(hw.name);
			$("#homeworkDue").val(hw.due);
			$("#homeworkDesc").val(hw.desc);
			$("#homeworkComplete").prop("checked", (hw.complete == "1"));
			$("#homeworkClass").val(hw.classId);

			$("#deleteHomeworkModal").show();

			$("#loadingModal").modal('hide');
			$("#homeworkModal").modal();
		});
	},
	handleNew: function() {
		if (MyHomeworkSpace.Page.current() == "homework" || MyHomeworkSpace.Page.current() == "planner") {
			MyHomeworkSpace.Page.show(MyHomeworkSpace.Page.current());
		}
	},
	markComplete: function(id, complete) {
		MyHomeworkSpace.API.get("homework/get/" + id, {}, function(xhr) {
			var hwItem = xhr.responseJSON.homework;
			hwItem.complete = complete;
			MyHomeworkSpace.API.post("homework/edit/", hwItem, function(xhr) {
				// yay
			});
		});
	},
	open: function() {
		$("#homeworkSoon .hwList").html('<ul></ul>');
		$("#homeworkLongterm .hwList").html('<ul></ul>');
		var classes = MyHomeworkSpace.Classes.list;
		MyHomeworkSpace.API.get("homework/get", {}, function(xhr) {
			var hw = xhr.responseJSON.homework;
			for (var hwIndex in hw) {
				var hwItem = hw[hwIndex];

				var due = moment(hwItem.due);
				var dueText = due.calendar().split(" at ")[0];
				var daysTo = Math.ceil(due.diff(moment()) / 1000 / 60 / 60 / 24);
				var prefix = hwItem.name.split(" ")[0];

				if (daysTo < 0 && hwItem.complete == "1") {
					continue;
				}

				if (dueText.indexOf(' ') > -1) {
					dueText = dueText[0].toLowerCase() + dueText.substr(1);
				}

				var $item = $('<div class="hwItem"></div>');

					$item.attr("data-hwId", hwItem.id);
					if (hwItem.complete == "1") {
						$item.addClass("done");
					}
					var $options = $('<div class="hwOptions"></div>');
						var $done = $('<i class="fa fa-check-square-o"></i>');
							$done.click(function() {
								$(this).parent().parent().toggleClass("done");
								MyHomeworkSpace.Pages.homework.markComplete($(this).parent().parent().attr("data-hwId"), ($(this).parent().parent().hasClass("done") ? "1" : "0"));
							});
						$options.append($done);
						$options.append(" ");
						var $edit = $('<i class="fa fa-edit"></i>');
							$edit.click(function() {
								MyHomeworkSpace.Pages.homework.edit($(this).parent().parent().attr("data-hwId"));
							});
						$options.append($edit);
					$item.append($options);
					var $name = $('<div class="hwName"></div>');
						$name.append($("<span></span>").text(prefix).addClass(MyHomeworkSpace.Prefixes.matchClass(prefix)));
						$name.append($("<span></span>").text(hwItem.name.substr(hwItem.name.indexOf(" "))));
						if (daysTo < 0) {
							$name.append(" (late)");
						}
					$item.append($name);
					var $subtext = $('<div class="hwSubText"></div>');
						$subtext.text("due " + dueText);
						for (var classIndex in classes) {
							if (classes[classIndex].id == hwItem.classId) {
								$subtext.append(" in " + classes[classIndex].name)
							}
						}
					$item.append($subtext);

					if (daysTo < 0) {
						$item.addClass("hwLate");
					}

				if (daysTo < 5) {
					$("#homeworkSoon .hwList ul").append($item);
				} else {
					$("#homeworkLongterm .hwList ul").append($item);
				}
			}
		});
	}
};
