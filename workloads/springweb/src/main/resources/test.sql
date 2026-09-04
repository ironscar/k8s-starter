create schema k8sdb;

create table k8sdb.tasks (
	id serial primary key,
	title varchar(20),
	completed char(1),
	user_id varchar(20)
);

insert into k8sdb.tasks (title, completed)
select * from (
	select 'task 1', 'N' union 
	select 'task 2', 'N' union
	select 'task 3', 'N' union
	select 'task 4', 'N' union
	select 'task 5', 'N'
);

select* from k8sdb.tasks order by id asc;
