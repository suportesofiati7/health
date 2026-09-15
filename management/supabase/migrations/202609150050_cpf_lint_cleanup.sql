begin;

create or replace function private.valid_cpf(value text) returns boolean
language plpgsql immutable set search_path='' as $$
declare checksum integer;
begin
  if value is null then return true; end if;
  if value !~ '^[0-9]{11}$' or value ~ '^([0-9])\1{10}$' then return false; end if;
  for digit_no in 10..11 loop
    checksum:=0;
    for position_no in 1..digit_no-1 loop
      checksum:=checksum+substring(value,position_no,1)::int*(digit_no+1-position_no);
    end loop;
    checksum:=(checksum*10)%11;
    if checksum=10 then checksum:=0; end if;
    if checksum<>substring(value,digit_no,1)::int then return false; end if;
  end loop;
  return true;
end $$;

commit;
