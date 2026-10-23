using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repos.interfaces
{
    public interface IGenericRepo<T> where T : class
    {
        Task<IList<T>> GetAll();
        Task<T> GetById(int id);
        Task Delete (T item);
        Task Update (T item);
        Task Create (T Item);
        Task Save();
    }
}